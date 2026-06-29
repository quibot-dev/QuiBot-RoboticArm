import React from 'react'
import { useParams } from "react-router-dom";
import ManualControl from '../Manual/Controlmanual';
import AutomaticPinça from '../Automatic/AutomaticPinça';
import ControlVeu from '../Veu/ControlVeu';

function Container({ user }) {
    function Estat() {
        const params = useParams();

        if (params.accessori === "ma" && params.mode === "Manual") {
            return <ManualControl user={user} />
        }
        if (params.accessori === "ma" && params.mode === "Automatic") {
            return <AutomaticPinça user={user} />
        }
        if (params.accessori === "ma" && params.mode === "Veu") {
            return <ControlVeu user={user} />
        }
    }
    return <><Estat /></>
}

export default Container