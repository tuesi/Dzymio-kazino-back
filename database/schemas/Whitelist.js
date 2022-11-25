const mongoose = require('mongoose');

const WhitelistSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('Whitelist', WhitelistSchema);