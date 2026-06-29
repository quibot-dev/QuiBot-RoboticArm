import { useState, useEffect } from "react";
import axios from 'axios';
import TableTerminals from "../../components/tables/TableTerminals";
import InfoCard from "../../components/InfoCard";

const Terminals = () => {

    const [total, setTotal] = useState(0);
    const [connectats, setConnectats] = useState(0);
    const [desconnectats, setDesconnectats] = useState(0);
    const [disponibles, setDisponibles] = useState(0);



    useEffect(() => {
        const interval = setInterval(() => {

            axios.get('/api/EV3/get/total', {})
                .then(res => {
                    setTotal(res.data.length);
                })
                .catch(error => console.error(`Error: ${error}`))

            axios.get('/api/EV3/get/connectats', {})
                .then(res => {
                    setConnectats(res.data);
                })
                .catch(error => console.error(`Error: ${error}`))
            axios.get('/api/EV3/get/desconnectats', {})
                .then(res => {
                    setDesconnectats(res.data);
                })
                .catch(error => console.error(`Error: ${error}`))
            axios.get('/api/EV3/get/disponibles', {})
                .then(res => {
                    setDisponibles(res.data);
                    console.log(res.data)
                })
                .catch(error => console.error(`Error: ${error}`))

        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="grid grid-cols-4 gap-5">
                <InfoCard name="Total" value={total} />
                <InfoCard name="Conectats" value={connectats} />
                <InfoCard name="Desconectats" value={desconnectats} />
                <InfoCard name="Disponibles" value={disponibles} />

            </div>
            <TableTerminals />
        </>
    )
}

export default Terminals
