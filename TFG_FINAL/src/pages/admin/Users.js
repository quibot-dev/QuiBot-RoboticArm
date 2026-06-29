import { useEffect, useState } from "react";
import axios from 'axios';
import TableUsers from "../../components/tables/TableUsers";
import InfoCard from "../../components/InfoCard";


const Users = () => {

    const [all, setAll] = useState(0);
    const [admins, setAdmins] = useState(0);
    const [students, setStudents] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            axios.get('/api/usuaris/get/total', {})
                .then(res => {
                  
                    setAll(res.data.length);
                })
                .catch(error => console.error(`Error: ${error}`))
            axios.get('/api/usuaris/get/administradors', {})
                .then(res => {
                    setAdmins(res.data.length);
                })
                .catch(error => console.error(`Error: ${error}`))
            axios.get('/api/usuaris/get/estudiants', {})
                .then(res => {
                    setStudents(res.data.length);
                })
                .catch(error => console.error(`Error: ${error}`))
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="grid grid-cols-3 gap-5">
                <InfoCard name="Total" value={all}/>
                <InfoCard name="Estudiants" value={students}/>
                <InfoCard name="Administradors" value={admins}/>
            </div>
            <TableUsers />
        </>
    )
}

export default Users