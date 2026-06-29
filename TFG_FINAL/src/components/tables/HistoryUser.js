import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import axios from 'axios'


const HistoryUser = () => {
    const params = useParams();
    const [userInfoHistory, setUserHistoryInfo] = useState([])
    const [userHistory, setHistory] = useState([])

    useEffect(() => {
        setHistory(userInfoHistory.reverse())
    }, [userInfoHistory])

    useEffect(() => {
        const interval = setInterval(() => {
            axios
                .post('/api/usuaris/historialUsuari', {
                    id: params.id,
                })
                .then(res => {
                   // console.log(res.data)
                    setUserHistoryInfo(res.data);
                })
                .catch(error => console.error(`Error: ${error}`))
        }, 500);
        return () => clearInterval(interval);
    }, [])

    return (
        <div className="mt-10 rounded-xl shadow h-full w-full bg-gray-50 relative overflow-auto" style={{height: 390}}>
            <table className="bg-white min-w-max w-full table-auto overflow-auto text-center">
                <thead>
                    <tr className="bg-gray-200 text-gray-900 uppercase text-sm leading-normal">
                        <th className="py-3 px-3">Data & Hora </th>
                        <th className="py-3 px-6 ml-80">Acció</th>
                        <th className="py-3 px-6 ml-80">Correu</th>

                    </tr>
                </thead>
                <tbody className="font-light text-xl">
                    {Object.keys(userHistory).map((item, i) => (
                        <tr className="border-b border-gray-200 hover:bg-gray-100" key={i}>
                            <td className="py-3 px-3"> {userHistory[item].Hora } </td>
                            <td className="py-3 px-3"> {userHistory[item].Accio}</td>
                            <td className="py-3 px-3"> {userHistory[item].Correu}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default HistoryUser
