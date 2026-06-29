import React, { useEffect, useState } from 'react'
import Titol from '../components/Titol'
import {  useNavigate, useParams} from "react-router-dom";


function Pinça_pipeta() {

 
    const params = useParams();
    let navigate = useNavigate();

        // Únic accessori disponible (Pinça) → redirigir directament sense mostrar selecció
    useEffect(() => {
        navigate("/Estudiant/" + params.ev3_id + '/ma', { replace: true });
    }, []);
 
    return null;
}

export default Pinça_pipeta