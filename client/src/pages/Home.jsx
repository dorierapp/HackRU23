import React from 'react'

const Home = () => {
    const handleSpotifyLogin = async() => {
        window.location.href = 'http://localhost:4000/auth/spotify';
    }

    return (
        <div className="flex flex-col justify-center items-center h-screen"> {/* Full-height and centering styles */}
            <h1 className="text-4xl mb-4 text-white text-center">Click this button to sign in</h1> {/* Large centered text */}
            <button
                type="button"
                onClick={handleSpotifyLogin}
                className="font-inter font-medium bg-[#1DB954] text-white px-4 py-2 rounded-md"
            >
                Login
            </button>
        </div>
    )
}

export default Home
