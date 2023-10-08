const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let userSchema = new Schema({
    username: {
        type: String
    },
    user_id: {
        type: String,
        required: true
    },
    display_name: {
        type: String
    },
    pictures: {
        type: Array
    },
    user_email: {
        type: String,
        required: true
    },
    spotify_uri: {
        type: String,
        required: true
    },
    access_token: {
        type: String,
        required: true
    }
})

const User = mongoose.model("User", userSchema);
module.exports = User