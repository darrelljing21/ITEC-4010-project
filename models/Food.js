const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: String,
    description: String,
    // For the convenience of demonstration, just store the string directly instead of using the Date object.
    expiryDate: String, 
    quantity: Number,
    status: { type: String, default: 'Available' }, // Status: Available or Reserved
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Associated with the publisher
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Who made the reservation?

    //evaluate
    rating :{type:Number, default:0},
    reviewComment:{type:String, default:''}

});

module.exports = mongoose.model('Food', foodSchema);