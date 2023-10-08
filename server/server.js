// import 'dotenv/config';
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const SpotifyStrategy = require('passport-spotify').Strategy;
const app = express();
const corsOptions = { origin: `http://localhost:5173`, credentials: true};
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: 'fillersecret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 24*60*60*1000
    }
}))
app.use(passport.initialize());
app.use(passport.session());
let user_id;

// MongoDB/Mongoose import and user model
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log("mongoDB connected successfully")
}).catch(err => {
    console.log(err);
})

const User = require("./models/userModel")
const Info = require("./models/spotifyInfoModel")



passport.use(
    new SpotifyStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: '/auth/spotify/callback'
      },
      async function(accessToken, refreshToken, expires_in, profile, done) {
        console.log(profile)
        user_id = profile.id;
        let user;

        try {
            user = await User.findOne({ user_id: profile.id });

            if (!user) {
            user = await User.create({
                username: profile.username,
                user_id: profile.id,
                display_name: profile._json.displayName,
                pictures: profile.photos,
                user_email: profile._json.email,
                spotify_uri: profile._json.uri,
                access_token: accessToken
            });
            await Info.create({ user_id: profile.id });
            }
        } catch (err) {
            return done(err);
        }
        return done(null, user)
      }
    )
);
// passport.serializeUser((user, cb) => {
//     cb(null, user);
// });
// passport.deserializeUser((user, cb) => {
//     cb(null, user);
// });

passport.serializeUser((user, cb) => {
    cb(null, user.id); // Use the user ID to serialize into the session
});

passport.deserializeUser(async (id, cb) => {
    try {
        const user = await User.findById(id);
        console.log("deserialize: " + user);
        cb(null, user); // Retrieve the user object from the database using the ID stored in the session
    } catch (err) {
        cb(err);
    }
});


app.get('/api/getUser', (req, res) => {
    console.log("request user")
    console.log(user_id)
    console.log(req.user)
    const userinfo = User.find({user_id: user_id})
    res.send(userinfo);
})

app.get('/api/info', (req, res) => {
    const information = Info.find({user_id: req.user.user_id});
    res.send(information);
})

app.get('/auth/spotify', passport.authenticate('spotify', { 
    scope: ['user-read-email', 'user-read-private']
    })
  );

app.get("/auth/spotify/callback",
    passport.authenticate("spotify", {
        successRedirect: "http://localhost:5173/profile",
        failureRedirect: "http://localhost:5173"
    })
    // ,
    // (req, res) => {
    //     console.log(req.user);
    //     // res.send(req.user);
    //     res.redirect("http://localhost:5173/profile")
    // }
    );

app.get("/api/spotify/getData", async (req, res) => {
    const token = await User.findOne({user_id: user_id}).then(data => {
        return data.access_token;
    })

    const topArtists = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10&offset=0`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method:'GET',
    body:JSON.stringify(body)
  }).items;

  const topSongs = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10&offset=0`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method:'GET',
    body:JSON.stringify(body)
  }).items;

  const playlists = await fetch(`https://api.spotify.com/v1/me/playlists`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method:'GET',
    body:JSON.stringify(body)
  }).items;

  Info.findOne({user_id: req.user.id}).then(user => {
    user.top_artists = topArtists;
    user.top_songs = topSongs;
    user.playlists = playlists;
    user.save();
  });


//   return await res.json();
})

app.listen(4000, (req, res) => {
    console.log("server started on port 4000")
})

//functions for the website
async function getAverageTrackFeatures(accessToken, playlistId) {
  const tracksEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
  const headers = {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
  };

  // Fetch tracks from the playlist
  const tracksResponse = await fetch(tracksEndpoint, { headers });
  const tracksData = await tracksResponse.json();

  // Extract track IDs
  const trackIds = tracksData.items.map(item => item.track.id);

  // Fetch audio features for the tracks
  const featuresEndpoint = `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(",")}`;
  const featuresResponse = await fetch(featuresEndpoint, { headers });
  const featuresData = await featuresResponse.json();

  // Calculate the average of the audio features
  const totalFeatures = featuresData.audio_features.reduce((acc, feature) => {
      acc.acousticness += feature.acousticness;
      acc.danceability += feature.danceability;
      acc.energy += feature.energy;
      acc.instrumentalness += feature.instrumentalness;
      acc.liveness += feature.liveness;
      acc.valence += feature.valence;
      acc.tempo += feature.tempo;
      return acc;
  }, {
      acousticness: 0,
      danceability: 0,
      energy: 0,
      instrumentalness: 0,
      liveness: 0,
      valence: 0,
      tempo: 0
  });

  const numberOfTracks = featuresData.audio_features.length;
  return [
      totalFeatures.acousticness / numberOfTracks,
      totalFeatures.danceability / numberOfTracks,
      totalFeatures.energy / numberOfTracks,
      totalFeatures.instrumentalness / numberOfTracks,
      totalFeatures.liveness / numberOfTracks,
      totalFeatures.valence / numberOfTracks,
      totalFeatures.tempo / numberOfTracks
  ];
}

async function getAverageFeaturesOfTop50Songs(accessToken) {
  const headers = {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
  };

  // 1. Fetch the user's top 50 songs
  const topTracksEndpoint = "https://api.spotify.com/v1/me/top/tracks?limit=50";
  const tracksResponse = await fetch(topTracksEndpoint, { headers });
  const tracksData = await tracksResponse.json();
  const trackIds = tracksData.items.map(track => track.id);

  // 2. Fetch audio features for the tracks
  const featuresEndpoint = `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(",")}`;
  const featuresResponse = await fetch(featuresEndpoint, { headers });
  const featuresData = await featuresResponse.json();

  // 3. Calculate the average of the audio features
  const totalFeatures = featuresData.audio_features.reduce((acc, feature) => {
      acc.acousticness += feature.acousticness;
      acc.danceability += feature.danceability;
      acc.energy += feature.energy;
      acc.instrumentalness += feature.instrumentalness;
      acc.liveness += feature.liveness;
      acc.valence += feature.valence;
      acc.tempo += feature.tempo;
      return acc;
  }, {
      acousticness: 0,
      danceability: 0,
      energy: 0,
      instrumentalness: 0,
      liveness: 0,
      valence: 0,
      tempo: 0
  });

  const numberOfTracks = featuresData.audio_features.length;
  return [
      totalFeatures.acousticness / numberOfTracks,
      totalFeatures.danceability / numberOfTracks,
      totalFeatures.energy / numberOfTracks,
      totalFeatures.instrumentalness / numberOfTracks,
      totalFeatures.liveness / numberOfTracks,
      totalFeatures.valence / numberOfTracks,
      totalFeatures.tempo / numberOfTracks
  ];
}

async function getGenres(accessToken, playlistId) {
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };

    let genres = [];
    playlist = 
     
    genres.forEach(function(song) {
        playlist
        // artists = song.artists;
        // artists.forEach(function(artist)) {
        //     artistGenres = artist.genre
        //     if(!genres.includes(genre)) {
                
        //     }
        }
    }

}





// Usage:
// Replace 'YOUR_SPOTIFY_ACCESS_TOKEN' with your actual Spotify access token
// Replace 'YOUR_PLAYLIST_ID' with the desired playlist ID
// getAverageTrackFeatures('YOUR_SPOTIFY_ACCESS_TOKEN', 'YOUR_PLAYLIST_ID')
//     .then(averages => {
//         console.log(averages);
//     })
//     .catch(error => {
//         console.error(error);
//     });

