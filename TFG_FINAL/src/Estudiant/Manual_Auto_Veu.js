import React from 'react'
import Titol from '../components/Titol'
import { useNavigate, useParams } from "react-router-dom";

function Manual_Auto_Veu() {
    const params = useParams();
    let navigate = useNavigate();

    const redirect = (id, accessori, mode) => {
        navigate("/Estudiant/" + id + '/' + accessori + '/' + mode)
    };

    const handleManual = () => {
        redirect(params.ev3_id, params.accessori, "Manual")
    };
    const handleAutomatic = () => {
        redirect(params.ev3_id, params.accessori, "Automatic")
    };
    const handleVeu = () => {
        redirect(params.ev3_id, params.accessori, "Veu")
    };

    return (
        <>
            <Titol titol={"Indica com voldras utilitzar el robot"} noPadding={true} />
            <div className='flex flex-row space-x-20 mt-32 justify-center'>
                <div className="items-center flex flex-col bg-white rounded-2xl shadow-xl shadow-slate-300/60 hover:opacity-25" onClick={() => handleManual()}>
                    <img className="aspect-video w-96 rounded-t-2xl object-cover object-center" width={300} height={300} src="./../../manual.png" alt='Programa el robot' />
                    <div className="mt-4 flex justify-center ">
                        <h1 className="text-2xl font-medium pb-1"> Manual </h1>
                    </div>
                </div>
                <div className="items-center flex flex-col bg-white rounded-2xl shadow-xl shadow-slate-300/60 hover:opacity-25 " onClick={() => handleAutomatic()}>
                    <img className="aspect-video w-96 rounded-t-2xl object-cover object-center" src="./../../DnD/robotma.png" alt='Control automatic' />
                    <div className="mt-4 flex justify-center ">
                        <h1 className="text-2xl font-medium pb-1 mb-4"> Automatic </h1>
                    </div>
                </div>
                <div className="items-center flex flex-col bg-white rounded-2xl shadow-xl shadow-slate-300/60 hover:opacity-25 " onClick={() => handleVeu()}>
                    <img className="aspect-video w-96 rounded-t-2xl object-cover object-center" width={300} height={300} src="/voice.png" alt='Control de veu' />
                    <div className="mt-4 flex justify-center ">
                        <h1 className="text-2xl font-medium pb-1 mb-4"> Veu </h1>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Manual_Auto_Veu