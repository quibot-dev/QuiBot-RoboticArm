import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Titol from "../../../components/Titol"
import Selector from "../../../components/Selector"
import { Dimensions } from 'react-native'


const EditTerminal = ({ user }) => {

    const params = useParams();
    let navigate = useNavigate();

    const [EV3, setEV3] = useState([]);
    const [EV3infohistoric, setEV3infohistoric] = useState([]);
    const [EV3Historic, setHistory] = useState([]);
    const [Connectat, setConnectat] = useState("");
    const [Disponible, setDisponible] = useState("");

    const boolOptions = [{ value: "", name: "-" }, { value: "1", name: "Si" }, { value: "0", name: "No" }]


    useEffect(() => {
        setHistory(EV3infohistoric.reverse())
    }, [EV3infohistoric])

    
    useEffect(() => {
        const interval = setInterval(() => {
            axios.post('/api/EV3/infoEV3', {
                id: params.id,
            })
                .then(res => {
                    setEV3(res.data[0])
                    
                    axios.post('/api/EV3/historialEV3', {
                        Nom: res.data[0].Nom,
                    })
                        .then(res1 => {
                            setEV3infohistoric(res1.data);
                        })
                        .catch(error => console.error(`Error: ${error}`))
                })
                .catch(error => console.error(`Error: ${error}`))
        }, 500);
        return () => clearInterval(interval);
    }, [params.id, user]);

    const handleSend = () => {
        axios
            .post('/api/EV3/editarEV3', { //enviem tot
                id: params.id,
                Nom: EV3.Nom,
                Connectat: Connectat,
                Disponible: Disponible,
                Usuari_Id: EV3.Usuari_Id,
                Ultima_Peticio: EV3.Ultima_Peticio,
                user_email: user.correu
            })
            .then(res => {
                setDisponible("");
                setConnectat("");
                
            })
            .catch(error => console.error(`Error: ${error}`))
    }

    const handleDelete = () => {
        axios
            .post('/api/EV3/eliminarEV3', {
                id: params.id,
                user_email: user.correu,
                Nom: EV3.Nom
            })
            .then(res => {
                setConnectat("");
                setDisponible("");
                
            })
            .catch(error => console.error(`Error: ${error}`))
        navigate("/administrador/EV3")
    }


    return (
        <>
            <Titol titol={EV3.Nom} noPadding={true} />
            <div className="flex flex-row grid-cols-2 gap-10 mt-10" >
                <div className="bg-gray-200 shadow rounded-xl p-4 w-1/3" >
                    <div className="w-full px-10">
                        <h1 className="my-5 mt-5 text-center text-xl leading-none font-bold text-gray-900"> Estat </h1>
                        <li className="my-3 "> Connectat: {EV3.Connectat ? "Si" : "No"} </li>
                        <li className="my-3"> Disponible: {EV3.Disponible ? "Si" : "No"} </li>
                    </div>
                </div>
                <div className="flex bg-gray-200 shadow rounded-xl p-4 w-2/3 ">
                    <div className="w-full px-10 mt-5">
                        <h1 className=" text-center text-xl leading-none font-bold mb-4 text-gray-900">Editar Estat EV3 </h1>
                        <div className="flex flex-row grid-col-2 gap-5">
                            <div className='w-full h-full'>

                                <Selector name="Connectat" value={Connectat} setValue={setConnectat} options={boolOptions} />
                                <button className="float-right shadow hover:bg-Tronja font-bold text-white bg-Tronja-clar py-2 px-4 rounded" onClick={() => handleSend()}>
                                    Guardar
                                </button>

                            </div>
                            <div className='w-full h-full'>

                                <Selector name="Disponible" value={Disponible} setValue={setDisponible} options={boolOptions} />
                                <button className="shadow hover:bg-Verd font-bold text-white bg-Verd-clar py-2 px-4 rounded" onClick={() => handleDelete()} >
                                    Eliminar EV3
                                </button>
                            </div>
                        </div>
                        <div className="justify-center flex flex-row font-bold gap-5">
                        </div>
                    </div>
                </div>
            </div>

            <div className='rounded-xl shadow h-full w-full bg-gray-50 relative overflow-auto mt-10' style={{ height: 450 }}>
                <table className="bg-white min-w-max w-full table-auto shadow text-center">
                    <thead>
                        <tr className="bg-gray-200 text-gray-900 uppercase text-sm leading-normal">
                            <th className="py-3 px-3">Hora </th>
                            <th className="py-3 px-3">Acció</th>
                            <th className="py-3 px-3">Usuari</th>
                            <th className="py-3 px-3">EV3</th>

                        </tr>
                    </thead>
                    <tbody className="font-light text-xl">
                        {Object.keys(EV3Historic).map((item, i) => (
                            <tr className="border-b border-gray-200 hover:bg-gray-100" key={i}>
                                <td className="py-3">{EV3Historic[item].Hora}</td>
                                <td className="py-3">{EV3Historic[item].Accio}</td>
                                <td className="py-3">{EV3Historic[item].Correu}</td>
                                <td className="py-3">{EV3Historic[item].Nom}</td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default EditTerminal
