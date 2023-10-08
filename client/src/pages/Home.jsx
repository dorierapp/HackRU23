import React from 'react';
import { spotify } from '../assets';

const Home = () => {
    const handleSpotifyLogin = async() => {
        window.location.href = 'http://localhost:4000/auth/spotify';
    }

    return (
        <div className="flex flex-col justify-center h-screen px-4"> {/* Added bg-black assuming you want a black background because text is white */}
            <h1 className="text-5xl font-bold mb-8 text-white text-center">Welcome to Spotify+</h1>
            <div className="flex items-center justify-center space-x-8"> 
                <div className="flex flex-col space-y-4 mr-10"> {/* Added right margin */}
                    <button
                        type="button"
                        onClick={handleSpotifyLogin}
                        className="font-inter font-medium bg-[#1DB954] text-white text-2xl px-8 py-4 rounded-lg"
                    >
                        Login
                    </button>
                </div>
                <img src={spotify} alt="Spotify Logo" className="w-72 h-72 ml-10" /> {/* Added left margin to push the logo to the right */}
            </div>
        </div>
    )
}

export default Home;
