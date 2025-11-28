const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Simplified version: No encrypted password, convenient for demonstration
    name: String,
    email: { type: String, required: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['donor', 'user'], required: true } // Distinguish between donors and ordinary users
});

module.exports = mongoose.model('User', userSchema);