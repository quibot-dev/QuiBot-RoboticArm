import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { Dimensions } from 'react-native'
import IconVCircle from "../../components/icons/IconVCircle"
import IconXCircle from "../../components/icons/IconXCircle"



const TableUsers = () => {

    const [users, setUsers] = useState([]);
    const screenHeight = Dimensions.get('window').height;

    let navigate = useNavigate();

    const redirect = (id) => {
        navigate("/administrador/usuaris/" + id)
    }

    useEffect(() => {
        const interval = setInterval(() => {

            axios
                .get('/api/usuaris/get/total', {
                })
                .then(res => {
                    console.log(res.data)
                    setUsers(res.data)
                })
                .catch(error => console.error(`Error: ${error}`))

        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-xl shadow mt-10 h-full w-full bg-gray-50 relative overflow-auto" style={{ height: screenHeight - 269 }}>
            <table className="bg-white min-w-max w-full table-auto overflow-auto text-center ">
                <thead>
                    <tr className="bg-gray-200 text-gray-900 uppercase text-sm leading-normal ">
                        <th className="py-3 px-3 ">Nom </th>
                        <th className="py-3 px-3 ">Cognoms </th>
                        <th className="py-3 px-3 "> Correu</th>
                        <th className="py-3 px-3 ">Rol </th>
                        <th className="py-3 px-3 ">Permis </th>
                        <th className="py-3 px-3 ">EV3 </th>
                    </tr>
                </thead>
                <tbody className="font-light text-xl">
                    {
                        Object.keys(users).map((item, i) => (
                            <tr className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer" key={i} onClick={() => redirect(users[item].id)}>
                                <td className="py-3 px-3 ">{users[item].Nom}</td>
                                <td className="py-3 px-3">{users[item].Primer_Cognom} {users[item].Segon_Cognom}</td>
                                <td className="py-3 px-3">{users[item].Correu}</td>
                                <td className="py-3 px-3">{users[item].Rol}</td>
                                <td className="py-3 px-3">
                                    <div className="flex place-content-center">
                                        {users[item].Permis ? <IconVCircle /> : <IconXCircle />}
                                    </div>
                                </td>
                                <td className="py-3 px-3">{users[item].EV3_id}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}

export default TableUsers

