const mongoose = require('mongoose');

const UserLivesSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: true,
        unique: true
    },
    lives: {
        type: Number,
        required: true
    },
    givenToday: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Lives', UserLivesSchema);