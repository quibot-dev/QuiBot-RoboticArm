import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ConfiguracioRobot from "./ConfiguracioRobot";
import AutomaticVision from "./AutomaticVision";

function AutomaticPinça({ user }) {
    const params = useParams();
    const [fase, setFase] = useState("configuracio"); // "configuracio" | "treballant"
    let EV3_id = params.ev3_id;

    const handleIniciar = (sequencia) => {
        axios.post('/api/EV3/nouEstat', {
            id: user.id,
            user_email: user.correu,
            id_EV3: EV3_id,
            Manual: 0,
            Automatic: 1,
            Pinça : 1,
            
        })
        .then(() => setFase("treballant"))
        .catch(error => console.error(`Error: ${error}`));
    };

    const handleStop = () => {
        axios.post('/api/EV3/nouEstat', {
            id: user.id,
            user_email: user.correu,
            id_EV3: EV3_id,
            Manual: 0,
            Automatic: 0,
            Pinça: 0,
            
        })
        .then(() => axios.post('/api/EV3/vision/stop'))
        .then(() => setFase("configuracio"))
        .catch(error => console.error(`Error: ${error}`));
    };

    if (fase === "configuracio") {
        return <ConfiguracioRobot onIniciar={handleIniciar} />;
    }

    return <AutomaticVision user={user} onStop={handleStop} />;
}

export default AutomaticPinça;
