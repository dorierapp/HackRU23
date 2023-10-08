import React from 'react'
import {BrowserRouter, Link, Route, Routes} from 'react-router-dom';
import { Home, Profile} from './pages'
import {logo} from './assets';
const App = () => {
  return (
    <BrowserRouter>
      <header className = "w-full flex justify-between items-center bg-black sm:px-8 px-4 py-4 border-b border-b-[#111111]">
        <Link to = "/">
          <img src={logo} alt = "logo" className= "w-28 object-contain"/>
        </Link>
      </header>
      <main className= "sm:p-8 px-4 py-8 w-full bg-[#121212] min-h-[calc(100vh-73px)]"> 
        <Routes>
          <Route path = "/" element = {<Home />} />
          <Route path = "/profile" element={<Profile/>}/>
        </Routes>
      </main>


    </BrowserRouter>
  )
}

export default App