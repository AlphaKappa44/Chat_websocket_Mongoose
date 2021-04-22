const {Schema, model} = require('mongoose');

const messageSchema = new Schema({
    username: String,
    message: String,
    date: Date
});

module.exports = model('Message', messageSchema);