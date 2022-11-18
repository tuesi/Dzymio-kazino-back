const passport = require('passport');
const DiscordStrategy = require('passport-discord');
const User = require('../database/schemas/User');
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
    scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
    const { id, username, discriminator, avatar, guilds } = profile;
    console.log(id, username, discriminator, avatar, guilds);
    const userGuildInfo = await getUserNameFromGuild(accessToken);
    const userNick = userGuildInfo.nick;
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
})
);