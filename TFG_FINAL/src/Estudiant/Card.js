import React, { useEffect, useState } from 'react'
import Titol from '../components/Titol'
import axios from 'axios'
import Card_Vinculat from "./Card_Vinculat";
import Esperant_Admin from './Esperant_Admin';
import { LazyLoadImage } from 'react-lazy-load-image-component';



function Card({ user }) {

    const [EV3s, setEV3s] = useState([]);

    const handleDemanarPermis = (robot, nomRobot) => {
        console.log(user.id, robot, user.correu)
        axios
            .post('/api/usuaris/permis', {
                id: user.id,
                id_EV3: robot,
                user_email: user.correu,
                Nom: nomRobot
            })
            .then(res => {
                console.log(res.data)


            })
            .catch(error => console.error(`Error: ${error}`))
    };

    useEffect(() => {
        const interval = setInterval(() => {
            axios
                .get('/api/EV3/get/disponibles_connectats', {})
                .then(res => {
                    setEV3s(res.data);
                })
                .catch(error => console.error(`Error: ${error}`))
        }, 500);
        return () => clearInterval(interval);
    }, [])


    return (
        <>
            {user.vinculat ? <Card_Vinculat user={user} /> : <>
                <Titol titol={"Escull quin robot vols utilitzar"} noPadding={true} />
                <div className='flex flex-row space-x-40 mt-32 justify-center'>

                    {user.permis && user.vinculat === null ? <Esperant_Admin /> : <>
                        {
                            Object.keys(EV3s).map((item, i) => (

                                <div className="items-center flex flex-col bg-white rounded-2xl shadow-xl shadow-slate-300/60 " key={i}>
                                    <LazyLoadImage effect="blur" src="/manual.png" className="aspect-video w-96 rounded-t-2xl object-cover object-center" />
                                    <div className="mt-4 flex justify-center ">
                                        <h1 className="text-2xl font-medium pb-1"> {EV3s[item].Nom}  </h1>
                                    </div>
                                    <div className='flex flex-col items-center p-2'>
                                        <small className=" text-s"> Connectat: {EV3s[item].Connectat ? "Si" : "No"}</small>
                                        <small className=" text-s"> Disponible: {EV3s[item].Disponible ? "Si" : "No"}</small>
                                        <button className=" p-5 mb-3 mt-3 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-Tronja-clar rounded-md hover:bg-Tronja" onClick={() => handleDemanarPermis(EV3s[item].id, EV3s[item].Nom)}>
                                            Demanar permis
                                        </button>
                                    </div>

                                </div>

                            ))
                        }
                    </>
                    }

                </div>
            </>
            }
        </>
    )
}

export default Card