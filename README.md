# HackRU23
Generates a playlist cover based on data collected about its contents. Utilizes APIs from Spotify, ChatGPT, and DALL-E.

Users sign in and select a playlist. Spotify's API is then used to parse descriptors of each song in the playlist. ChatGPT uses the name of the playlist and the most significant descriptors to write a prompt for  DALL-E, which generates an image which can be used as the playlist's cover.
Source files can be found in the master branch.
