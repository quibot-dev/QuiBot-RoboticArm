import { useNavigate } from "react-router-dom"
import IconVCircle from "../../components/icons/IconVCircle"
import IconXCircle from "../../components/icons/IconXCircle"
import { useState, useEffect} from "react"
import axios from 'axios'
import { Dimensions } from 'react-native'

export default function TableTerminals() {

    const [terminals, setTerminals] = useState([]);
    const screenHeight = Dimensions.get('window').height;

    let navigate = useNavigate();

    const redirect = (id) => {
        navigate("/administrador/EV3/"+id)
    }

    useEffect(() => {
        const interval = setInterval(() => {
            axios.get('/api/EV3/get/total', {})
                .then(res => {
                    setTerminals(res.data)
                })
                .catch(error => console.error(`Error: ${error}`))
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return(
    <div className="rounded-xl shadow mt-10 h-full w-full bg-gray-50 relative overflow-auto" style={{height: screenHeight - 269}}>
        <table className="min-w-max w-full table-auto text-center">
            <thead>
                <tr className="bg-gray-200 text-gray-900 uppercase text-sm leading-normal">
                    <th className="py-3 px-3">ID </th>
                    <th className="py-3 px-3">Nom </th>
                    <th className="py-3 px-3">Connectat </th>
                    <th className="py-3 px-3">Disponible </th>
                </tr>
            </thead>
            <tbody className="font-light text-xl">
                {
                    Object.keys(terminals).map((item, i) => (
                        <tr className="border-b hover:bg-gray-100 cursor-pointer" key={i} onClick={() => redirect(terminals[item].id)}>
                            <td className="py-3 px-3 whitespace-nowrap">{terminals[item].id}</td>
                            <td className="py-3 px-3 whitespace-nowrap">{terminals[item].Nom}</td>
                            <td className="py-3 px-3">
                                <div className="flex place-content-center">
                                    {terminals[item].Connectat ? <IconVCircle/> : <IconXCircle/> }
                                </div>
                            </td>
                            <td className="py-3 px-3">
                                <div className="flex place-content-center">
                                    {terminals[item].Disponible ? <IconVCircle/> : <IconXCircle/>}
                                </div>
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    </div>
    )
}