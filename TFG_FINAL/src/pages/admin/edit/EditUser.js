import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import Titol from "../../../components/Titol"
import HistoryUser from "../../../components/tables/HistoryUser"
import Selector from "../../../components/Selector"
import Input from "../../../components/Input"
const { createHash } = require('crypto')

function hash(string) {
    return createHash('sha256').update(string).digest('hex');
}

const EditUser = ({ user }) => {

    const params = useParams();
    let navigate = useNavigate();
    const [userInfo, setUserInfo] = useState([]);
    const [Nom, setNom] = useState("");
    const [Primer_Cognom, setPrimer_Cognom] = useState("");
    const [Segon_Cognom, setSegon_Cognom] = useState("");
    const [Correu, setCorreu] = useState("");
    const [Contrassenya, setContrassenya] = useState("");
    const [Rol, setRol] = useState("");
    const rolSelector = [{ value: "", name: "-" }, { value: "Estudiant", name: "Estudiant" }, { value: "Administrador", name: "Administrador" }]

    useEffect(() => {
        const interval = setInterval(() => {
            axios.post('/api/usuaris/infoUsuari', {
                id: params.id,
            })
                .then(res => {
                    setUserInfo(res.data[0]);
                })
                .catch(error => console.error(`Error: ${error}`))
        }, 500);
        return () => clearInterval(interval);
    }, [params.id, user.id]);



    const handleSend = () => {
        axios
            .post('/api/usuaris/editarUsuari', { //enviem tot
                id: params.id,
                Nom: Nom,
                Primer_Cognom: Primer_Cognom,
                Segon_Cognom: Segon_Cognom,
                Contrassenya: hash(Contrassenya),
                Rol: Rol,
                Correu: Correu,
                user_email: user.correu
            })
            .then(res => {
                setNom("");
                setPrimer_Cognom("");
                setSegon_Cognom("");
                setContrassenya("")
                setCorreu("");
                setRol("");
            })
            .catch(error => console.error(`Error: ${error}`))
    }

    const handleDelete = () => {
        axios
            .post('/api/usuaris/eliminarUsuari', {
                id: params.id,
                user_email: user.correu
            })
            .then(res => {
                setNom("");
                setPrimer_Cognom("");
                setSegon_Cognom("");
                setContrassenya("")
                setCorreu("");
                setRol("");
            })
            .catch(error => console.error(`Error: ${error}`))
        navigate("/administrador/usuaris")
    }


    return (
        <>
            <div className='mb-10'>
                <Titol titol={userInfo.Nom} noPadding={true} />
            </div>
            <div className="flex flex-row grid-cols-2 gap-10" >
                <div className="bg-gray-200 shadow rounded-xl p-4 w-1/3" >
                    <div className="w-full px-10">
                        <h1 className="my-5 mt-5 text-center text-xl leading-none font-bold text-gray-900"> Detalls </h1>
                        <li className="my-3 "> Nom: {userInfo.Nom} </li>
                        <li className="my-3 "> Primer Cognom: {userInfo.Primer_Cognom} </li>
                        <li className="my-3 "> Segon Cognom: {userInfo.Segon_Cognom} </li>
                        <li className="my-3 "> Correu:  {userInfo.Correu} </li>
                        <li className="my-3 "> Rol: {userInfo.Rol} </li>
                        <li className="my-3 "> Permis: {userInfo.Permis} </li>
                    </div>
                </div>
                <div className="flex items-center bg-gray-200 shadow rounded-xl p-4 w-2/3 ">
                    <div className="w-full px-10">
                        <h1 className=" mt-5 text-center text-xl leading-none font-bold text-gray-900 ">Editar Informació </h1>
                        <div className="flex flex-row grid-col-2 gap-5">
                            <div className="w-full h-full">
                                <Input name="Nom" value={Nom} setValue={setNom} type="text" />
                                <Input name="Primer Cognom" value={Primer_Cognom} setValue={setPrimer_Cognom} type="text" />
                                <Input name="Segon Cognom" value={Segon_Cognom} setValue={setSegon_Cognom} type="text" />

                            </div>
                            <div className="w-full h-full">
                                <Input name="Correu" value={Correu} setValue={setCorreu} type="email" />
                                <Input name="Contrasenya" value={Contrassenya} setValue={setContrassenya} type="password" />
                                <Selector name="Rol" value={Rol} setValue={setRol} options={rolSelector} />

                            </div>
                        </div>

                        <div className="justify-center flex flex-row font-bold gap-5 text-white">
                            <button className="shadow hover:bg-Tronja font-bold bg-Tronja-clar py-2 px-4 rounded" onClick={() => handleSend()}> Guardar</button>

                            <button onClick={() => handleDelete()} className="shadow hover:bg-Verd font-bold bg-Verd-clar py-2 px-4 rounded">
                                Eliminar Usuari
                            </button>

                        </div>
                    </div>
                </div>
            </div>

            <div className='mt-10 '>
                <HistoryUser />
            </div>
        </>
    )
}

export default EditUser
