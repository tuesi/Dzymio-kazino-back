const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    lost: {
        type: Number,
        required: true
    },
    won: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);