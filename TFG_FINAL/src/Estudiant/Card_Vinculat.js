import React, { useEffect, useState } from 'react'
import Titol from '../components/Titol'
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from 'react-lazy-load-image-component';


function Card_Vinculat({ user }) {

    const [EV3s, setEV3s] = useState([]);

    let navigate = useNavigate();

    const redirect = (id) => {
        navigate("/estudiant/" + id)
    };

    const handleJugar = (robot) => {
       
       redirect(robot);
    };

    const handleDesvincular = (EV3_id, nom_robot) => {

        axios
            .post('/api/usuaris/desvincular', {
                id: user.id,
                EV3_id: EV3_id,
                user_email: user.correu,
                correu_estudiant: user.correu,
                nom_robot: nom_robot
            })
            .then(res => {
                console.log(res.data)
            })
            .catch(error => console.error(`Error: ${error}`))
    };


    useEffect(() => {
        const interval = setInterval(() => {
            axios
                .get('/api/EV3/get/vinculats', {})
                .then(res => {
                    setEV3s(res.data);
                })
                .catch(error => console.error(`Error: ${error}`))
        }, 500);
        return () => clearInterval(interval);
    }, [])




    return (
        <>

            <Titol titol={"Ara et toca a tu, Experimenta i juga!"} noPadding={true} />
            <div className='flex flex-row space-x-40 mt-24 justify-center'>

                {Object.keys(EV3s).map((item, i) => {
                    return <>
                        {user.id === EV3s[item].Usuari_Id ?
                            <>

                                <div className="items-center flex flex-col bg-white rounded-2xl shadow-xl shadow-slate-300/60 " key={i}>
                                    <LazyLoadImage effect="blur" src="/manual.png" className="aspect-video w-96 rounded-t-2xl object-cover object-center" />
                                    <div className="mt-4 flex justify-center ">
                                        <h1 className="text-2xl font-medium pb-1"> {EV3s[item].Nom} - {EV3s[item].id} </h1>
                                    </div>
                                    <div className='flex flex-col items-center p-2'>
                                        <small className=" text-s"> Connectat: {EV3s[item].Connectat ? "Si" : "No"}</small>
                                        <small className=" text-s"> Disponible: {EV3s[item].Disponible ? "Si" : "No"}</small>
                                       
                                        <button className=" p-5 mb-3 mt-3 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-Tronja-clar rounded-md hover:bg-Tronja" onClick={() => handleJugar(EV3s[item].id)}>
                                            Jugar
                                        </button>
                                        <button className=" p-5 mb-3 mt-3 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-Verd-clar rounded-md hover:bg-Verd" onClick={() => handleDesvincular(EV3s[item].Usuari_Id, EV3s[item].Nom)}>
                                            Deslinquejar
                                        </button>
                                    </div>

                                </div>
                            </>
                            : null}
                    </>
                }

                )
                }

            </div>
        </>
    )
}

export default Card_Vinculat