const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recordSchema = new Schema({
    name: String,
    phone: Number,
    email: String,
    hobbies: String
});

module.exports = mongoose.model('Record', recordSchema);