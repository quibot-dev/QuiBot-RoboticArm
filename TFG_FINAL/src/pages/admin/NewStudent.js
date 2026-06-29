import { useState } from 'react'
import axios from 'axios'
import Titol from '../../components/Titol'
import Selector from "../../components/Selector"
import Input from "../../components/Input"
const { createHash } = require('crypto')

function hash(string) {
    return createHash('sha256').update(string).digest('hex');
}

const NewStudent = () => {

    const [Nom, setNom] = useState("");
    const [Primer_Cognom, setPrimer_Cognom] = useState("");
    const [Segon_Cognom, setSegon_Cognom] = useState("");
    const [Correu, setCorreu] = useState("");
    const [Contrassenya, setContrassenya] = useState("");
    const [Rol, setRol] = useState("");
    const rolSelector = [{ value: "", name: "-" }, { value: "Estudiant", name: "Estudiant" }, { value: "Administrador", name: "Administrador" }]

    const handleSend = () => {
        if ((Contrassenya.length > 0) && (Correu.length > 0) && (Rol.length > 0) && (Primer_Cognom.length > 0) && (Segon_Cognom.length > 0) && (Nom.length > 0)) {
            console.log('1')
            axios.post('/api/usuaris/nouUsuari', {
                Nom: Nom,
                Rol: Rol,
                Primer_Cognom: Primer_Cognom,
                Segon_Cognom: Segon_Cognom,
                Contrassenya: hash(Contrassenya),
                Correu: Correu,

            })
                .then(res => {
                    setNom("");
                    setPrimer_Cognom("");
                    setSegon_Cognom("");
                    setContrassenya("");
                    setCorreu("");
                    setRol("");
                })
                .catch(error => console.error(`Error: ${error}`))
        }
    }

    return (
        <>
            <Titol titol="Afegeix un nou usuari al Sistema!" noPadding={true} />
            <div className="mx-auto container mt-10 items-center bg-gray-200 shadow rounded-xl px-10 py-5 w-2/3" >
                <div className="flex flex-row grid-col-2 gap-7">
                    <div className="w-full h-full">
                        <Input name="Nom" value={Nom} setValue={setNom} type="text" />
                        <Input name="Primer_Cognom" value={Primer_Cognom} setValue={setPrimer_Cognom} type="text" />
                        <Input name="Segon_Cognom" value={Segon_Cognom} setValue={setSegon_Cognom} type="text" />
                    </div>
                    <div className="w-full h-full">
                        <Input name="Correu" value={Correu} setValue={setCorreu} type="email" />
                        <Input name="Contrasenya" value={Contrassenya} setValue={setContrassenya} type="password" />
                        <Selector name="Rol" value={Rol} setValue={setRol} options={rolSelector} />
                    </div>
                </div>
                <button className="w-full shadow hover:bg-Tronja  text-white  bg-Tronja-clar font-bold py-2 px-4 rounded" onClick={() => handleSend()}>
                    Crear
                </button>
            </div>
        </>
    )
}

export default NewStudent
