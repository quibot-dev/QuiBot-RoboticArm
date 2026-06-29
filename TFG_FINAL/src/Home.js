import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { LazyLoadImage } from "react-lazy-load-image-component"
import HistoryUsers from './components/tables/HistoryUsers'
import HistorialEV3 from './components/tables/HistorialEV3'
import Titol from './components/Titol'

function Home({ user }) {

    const [Usuaris, setUsuaris] = useState([]);
    const [EV3s, setEV3s] = useState([]);
    const [UsuarisVinculats, setUsuarisVinculats] = useState([]);
    const [EV3Vinculats, setEV3Vinculats] = useState([]);




    useEffect(() => {
        const interval = setInterval(() => {
            axios
                .get('/api/usuaris/get/vinculats', {})
                .then(res => {
                    console.log("Vinculats", res.data)
                    const sorted = [...res.data].sort((a,b) => (a.id > b.id ) ? 1:-1);
                    console.log("Usuaris Vinculat sorted: ", sorted)
                    setUsuarisVinculats(sorted);
                })
                .catch(error => console.error(`Error: ${error}`))
        }, 2000);
        return () => clearInterval(interval);
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            axios
                .get('/api/EV3/get/vinculats', {})
                .then(res => {
                    const sorted = [...res.data].sort((a,b) => (a.Usuari_Id > b.Usuari_Id ) ? 1:-1);
                    console.log("EV3 Vinculat sorted: ", sorted)
                    setEV3Vinculats(sorted);
                })
                .catch(error => console.error(`Error: ${error}`))
        }, 2000);
        return () => clearInterval(interval);
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            axios
                .get('/api/usuaris/get/esperant_vinculacio', {})
                .then(res => {
                    const sorted = [...res.data].sort((a,b) => (a.id > b.id ) ? 1:-1);
                    console.log("Usuaris  sorted: ", sorted)
                    setUsuaris(sorted);
                })
                .catch(error => console.error(`Error: ${error}`))
        }, 2000);
        return () => clearInterval(interval);
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            axios
                .get('/api/EV3/esperantVincularse', {})
                .then(res => {
                    const sorted = [...res.data].sort((a,b) => (a.Usuari_Id > b.Usuari_Id ) ? 1:-1);
                    console.log("EV3 sorted: ", sorted)
                    setEV3s(sorted);
                })
                .catch(error => console.error(`Error: ${error}`))
        }, 2000);
        return () => clearInterval(interval);
    }, [])




    const handleVincular = (Usuari_id_linquejat_EV3, user_id, correu_estudiant, nom_robot) => {

      

        axios
            .post('/api/usuaris/vincular', {
                id: user_id,
                EV3_id: Usuari_id_linquejat_EV3,
                user_email: user.correu,
                correu_estudiant: correu_estudiant,
                nom_robot: nom_robot
            })
            .then(res => {
                console.log(res.data)
            })
            .catch(error => console.error(`Error: ${error}`))
    };

    const handleDesvincular = (EV3_id, user_id, correu_estudiant, nom_robot) => {

        axios
            .post('/api/usuaris/desvincular', {
                id: user_id,
                EV3_id: EV3_id,
                user_email: user.correu,
                correu_estudiant: correu_estudiant,
                nom_robot: nom_robot
            })
            .then(res => {
                console.log(res.data)
            })
            .catch(error => console.error(`Error: ${error}`))
    };



  


    return (
        <>


            {Object.keys(Usuaris).map((item_User, i) => (
                Object.keys(EV3s).map((item_EV3, k) => {
                    return <>
                        {Usuaris[item_User].id === EV3s[item_EV3].Usuari_Id ?
                            <>
                                <div className="ml-52 mb-10 w-3/4 grid animate-pulse gap-6 mt-10 px-4 -mx-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 bg-gray-200 rounded-md" key={i}>
                                    <div className="px-3 py-4 transition-colors duration-200 transform rounded-lg  dark:hover:bg-gray-700">
                                        <h4 className="mt-2 text-4xl font-semibold text-gray-800 dark:text-gray-100"> {Usuaris[item_User].Nom} <span class="text-base font-normal text-gray-600 dark:text-gray-400"> {Usuaris[item_User].Primer_Cognom} {Usuaris[item_User].Segon_Cognom}</span></h4>
                                        <div className="mt-8 space-y-8">

                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-Tronja" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                                </svg>
                                                <span className="mx-4 text-gray-700 dark:text-gray-300"> {Usuaris[item_User].Correu} </span>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="px-3 py-4 transition-colors duration-200 transform rounded-lg ">
                                        <LazyLoadImage effect="blur" src='/chain.png' className=" hidden xl:block" />

                                    </div>

                                    <div className="px-3 py-4 transition-colors duration-200 transform rounded-lg  dark:hover:bg-gray-700">
                                        <h4 className="mt-2 text-4xl font-semibold text-gray-800 dark:text-gray-100"> {EV3s[item_EV3].Nom} <span class="text-base font-normal text-gray-600 dark:text-gray-400"> Id: {EV3s[item_EV3].id} </span></h4>
                                        

                                    </div>
                                    <div className="flex flex-col items-center py-4 transition-colors duration-200 transform rounded-lg  ">

                                        <button className="w-1/2  py-2 mt-10 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-Tronja-clar rounded-md hover:bg-Tronja" onClick={() => handleVincular(EV3s[item_EV3].Usuari_Id, Usuaris[item_User].id, Usuaris[item_User].Correu, EV3s[item_EV3].Nom)} >
                                            Vincular
                                        </button>

                                        <button className="w-1/2 py-2 mt-10 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-Verd-clar rounded-md hover:bg-Verd" onClick={() => handleDesvincular(EV3s[item_EV3].Usuari_Id, Usuaris[item_User].id, Usuaris[item_User].Correu, EV3s[item_EV3].Nom )}>
                                            Denegar
                                        </button>
                                    </div>
                                </div>
                            </>
                            : null}
                    </>
                }
                )
            ))
            }

            {Object.keys(UsuarisVinculats).map((item_UserVinculat, j) => (
                Object.keys(EV3Vinculats).map((item_EV3Vinculat, l) => {
                    return <>
                        {EV3Vinculats[item_EV3Vinculat].Usuari_Id === UsuarisVinculats[item_UserVinculat].id ?
                            <>
                                <div className="ml-52 mb-10 w-3/4 grid animate-pulse gap-6 mt-10 px-4 -mx-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 bg-gray-200 rounded-md" key={j}>
                                    <div className="px-3 py-4 transition-colors duration-200 transform rounded-lg  dark:hover:bg-gray-700">
                                        <h4 className="mt-2 text-4xl font-semibold text-gray-800 dark:text-gray-100"> {UsuarisVinculats[item_UserVinculat].Nom} <span class="text-base font-normal text-gray-600 dark:text-gray-400"> {UsuarisVinculats[item_UserVinculat].Primer_Cognom} {UsuarisVinculats[item_UserVinculat].Segon_Cognom}</span></h4>
                                        <div className="mt-8 space-y-8">

                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-Tronja" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                                </svg>
                                                <span className="mx-4 text-gray-700 dark:text-gray-300"> {UsuarisVinculats[item_UserVinculat].Correu} </span>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="px-3 py-4 transition-colors duration-200 transform rounded-lg ">
                                        <LazyLoadImage effect="blur" src="/chain.png" className=" hidden xl:block" />

                                    </div>

                                    <div className="px-3 py-4 transition-colors duration-200 transform rounded-lg  dark:hover:bg-gray-700">
                                        <h4 className="mt-2 text-4xl font-semibold text-gray-800 dark:text-gray-100"> {EV3Vinculats[item_EV3Vinculat].Nom} <span class="text-base font-normal text-gray-600 dark:text-gray-400"> Id: {EV3Vinculats[item_EV3Vinculat].id} </span></h4>
                                       
                                    </div>
                                    <div className="flex flex-col items-center py-4 transition-colors duration-200 transform rounded-lg  ">
                                        <button className="w-1/2 py-2 mt-10 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-Verd-clar rounded-md hover:bg-Verd" onClick={() => handleDesvincular(EV3Vinculats[item_EV3Vinculat].Usuari_Id, UsuarisVinculats[item_UserVinculat].id, UsuarisVinculats[item_UserVinculat].Correu, EV3Vinculats[item_EV3Vinculat].Nom)}>
                                            Desvincular
                                        </button>
                                    </div>
                                </div>
                            </>
                            : null}
                    </>
                })
            ))}


            <Titol titol="Historic Usuaris" noPadding={true} />
            <HistoryUsers />
            <Titol titol="Historic EV3" noPadding={false} />
            <HistorialEV3 />


        </>
    )
}

export default Home