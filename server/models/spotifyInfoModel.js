const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let infoSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    top_artists: {
        type: Array
    },
    top_songs: {
        type: Array
    },
    playlists: {
        type: Array
    }
})

const Info = mongoose.model("Info", infoSchema);
module.exports = Info