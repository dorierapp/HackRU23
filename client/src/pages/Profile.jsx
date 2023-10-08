import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import{preview} from '../assets';
import {getRandomPrompt} from '../utils';
import{FormField, Loader} from '../components';

const Profile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    prompt: '',
    photo:'',
  });
  const [generatingImg, setGeneratingImg]= useState(false);
  const[loading,setloading]= useState(false);
  const genre = "Rock";
  const PRESET_PROMPT  = getRandomPrompt(genre);
  const [data, setData] = useState('');
  useEffect(() => {
    console.log("fetching data")
    // fetch('http://localhost:4000/api/getUser')
    //   .then((data) => {
    //     setData(data)
    //     console.log(data)
    //     // setLoading(false)
    //   })

    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/getUser', {
          method: 'GET',
          credentials: 'include', // Ensure credentials are included for cross-origin requests
        });

        // Check if the response is successful (status code 200)
        if (response.ok) {
          const result = await response.json(); // Parse the JSON data from the response
          console.log(result)
          setData(result); // Set the data in your state
        } else {
          console.error('Error:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    // Call the fetchData function
    fetchData();
  }, [])


    const generateImage = async () => {
        try {
            setGeneratingImg(true);
            const response = await fetch('https://dalle-clone-gm8q.onrender.com/api/v1/dalle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: PRESET_PROMPT }),
            });
    
            const data = await response.json();
            setForm({ ...form, photo: `data:image/jpeg;base64,${data.photo}` });
    
        } catch (error) {
            alert(error);
        } finally {
            setGeneratingImg(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (form.photo) {
            setloading(true);
            try {
                const response = await fetch('https://dalle-clone-gm8q.onrender.com/api/v1/post', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ...form, prompt: PRESET_PROMPT }),
                });
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                await response.json();
                navigate('/');
            } catch (err) {
                console.error('Error:', err);
                alert('Failed to submit the form. Please try again later.');
            } finally {
                setloading(false);
            }
        } else {
            alert('Please generate an image with proper details');
        }
    };
    const handleSurpriseMe = () =>{
        const randomPrompt = getRandomPrompt(form.prompt);
        setForm({...form, prompt: randomPrompt})
    };

    const handleLogout = async () => {
      try {
        const res = await fetch('http://localhost:4000/logout', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          }
        });
        if(res) {
          navigate('/');
        }
      } catch(err) {
        console.log(err)
      }
    }

    const playlists = [
      "playlist1",
      "playlist2",
      "playlist3",
      "playlist4"
    ]

    const fetchData = async (prompt) => {
      // prompt = category (songs, artists, etc.)
      // Get the data needed for the prompt from the backend by utilizing what prompt is entered
      // into the dropdown
      // Call this function during the image generation to create the prompt
      try {
        const res = await fetch('https://localhost:4000/api/retrieveData')
        return res.json();
      } catch(err) {
        console.log(err)
      }
    }

    
    return (
        <section className="max-w-7xl mx-auto">
          <div>
            <div className='flex'>
              <h1 className="font-extrabold text-[#ffffff] text-[32px]">{data.username}</h1>
              <button className="font-extrabold text-[#ffffff] text-[20px] ml-[15px]" onClick={() => handleLogout()}>Logout</button>
            </div>
            <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">Blank blank blank blank</p>
            <select
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="songs">Songs</option>
              <option value="artists">Artists</option>
              {playlists.map(name => {
                <option value={name}>{name}</option>
              })}
            </select>
          </div>
    
          <form className="mt-16 max-w-3xl" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
    
              <div className="relative bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 p-3 h-64 flex justify-center items-center">
                { form.photo ? (
                  <img
                    src={form.photo}
                    alt={form.prompt}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="preview"
                    className="w=11/12 h-11/12 object-contain opacity-40"
                  />
                )}
    
                {generatingImg && (
                  <div className="absolute inset-0 z-0 flex justify-center items-center bg-[rgba(0,0,0,0.5)] rounded-lg">
                    <Loader />
                  </div>
                )}
              </div>
            </div>
    
            <div className="mt-5 flex gap-5">
              <button
                type="button"
                onClick={generateImage}
                className=" text-white bg-[#1DB954] font-medium rounded-lg text-sm w-full sm:w-64 px-5 py-2.5 text-center"
              >
                {generatingImg ? 'Generating Playlist Art...' : 'Generate Playlist Art'}
              </button>
            </div>
          </form>
        </section>
      );
}

export default Profile