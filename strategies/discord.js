const passport = require('passport');
const DiscordStrategy = require('passport-discord');
const User = require('../database/schemas/User');
const Whitelist = require('../database/schemas/Whitelist');
const { getUserNameFromGuild } = require('../services/api');

passport.serializeUser((user, done) => {
    done(null, user.discordId);
});

passport.deserializeUser(async (discordId, done) => {
    try {
        const user = await User.findOne({ discordId });
        return user ? done(null, user) : done(null, null);
    } catch (err) {
        console.log(err);
        done(err, null);
    }
});

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ['identify', 'guilds', 'guilds.members.read']
}, async (accessToken, refreshToken, profile, done) => {
    const { id, username, discriminator, avatar, guilds } = profile;
    var authorized = false;

    if (process.env.WHITELIST == 'true') {
        authorized = await Whitelist.findOne({ discordId: id }) ? true : false;
    } else {
        guilds.forEach(async guild => {
            if (guild.id == process.env.GUILD_ID) {
                authorized = true;
            }
        });
    }

    if (authorized) {
        const userGuildInfo = await getUserNameFromGuild(accessToken);
        let userNick = null;
        if (userGuildInfo.nick) {
            userNick = userGuildInfo.nick;
        } else {
            userNick = username;
        }
        try {
            const findUser = await User.findOneAndUpdate({ discordId: id }, {
                discordTag: `${username}#${discriminator}`,
                avatar: avatar,
                guildNick: userNick
            }, { new: true });
            if (findUser) {
                console.log('user was found');
                return done(null, findUser);
            } else {
                const newUser = await User.create({
                    discordId: id,
                    discordTag: `${username}#${discriminator}`,
                    avatar: avatar,
                    guildNick: userNick
                });
                return done(null, newUser);
            }
        } catch (err) {
            console.log(err);
            return done(err, null);
        }
    } else {
        return done(null, false);
    }
})
);