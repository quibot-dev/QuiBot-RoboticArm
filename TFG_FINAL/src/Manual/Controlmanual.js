import { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Titol from "../components/Titol";

const NOM = "EV3_1";

const MOTORS = [
    {
        label: "Base",
        icon: "↔",
        left:  { cmd: "base_left",  label: "← Esquerra" },
        right: { cmd: "base_right", label: "Dreta →" },
    },
    {
        label: "Espatlla",
        icon: "↕",
        left:  { cmd: "shoulder_down", label: "↓ Baixar" },
        right: { cmd: "shoulder_up",   label: "Pujar ↑" },
    },
    {
        label: "Colze",
        icon: "↕",
        left:  { cmd: "elbow_down", label: "↓ Baixar" },
        right: { cmd: "elbow_up",   label: "Pujar ↑" },
    },
    {
        label: "Pinça",
        icon: "✋",
        left:  { cmd: "gripper_close", label: "✊ Tancar" },
        right: { cmd: "gripper_open",  label: "Obrir ✋" },
    },
];

const ManualControl = () => {
    const params = useParams();
    const [activeCmd, setActiveCmd] = useState("STOP");

    const sendCmd = useCallback((cmd) => {
        axios.post("/api/EV3/manualMove", { Nom: NOM, cmd })
            .then(() => setActiveCmd(cmd))
            .catch(console.error);
    }, []);

    // Activar mode Manual al servidor 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        axios.post("/api/EV3/nouEstat", {
            id_EV3: params.ev3_id,
            Manual: 1, Automatic: 0, "Pinça": 0,
            user_email: ""
        }).catch(console.error);

        return () => {
            axios.post("/api/EV3/nouEstat", {
                id_EV3: params.ev3_id,
                Manual: 0, Automatic: 0, "Pinça": 0,
                user_email: ""
            }).catch(console.error);
            sendCmd("STOP");
        };
    }, []);

    const handleClick = (cmd) => {
        if (activeCmd === cmd) {
            sendCmd("STOP");
        } else {
            sendCmd(cmd);
        }
    };

    return (
        <>
            <Titol titol={"Control Manual"} noPadding={true} />
            <div style={{ padding: "24px 16px", maxWidth: 640, margin: "0 auto" }}>

                {/* Estat */}
                <p style={{ textAlign: "center", fontWeight: 600, fontSize: 14, marginBottom: 20,
                    color: activeCmd !== "STOP" ? "#22c55e" : "#ef4444" }}>
                    {activeCmd !== "STOP" ? `● En moviment: ${activeCmd}` : "● Aturat"}
                </p>

                {/* Botons motors */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {MOTORS.map((motor) => (
                        <div key={motor.label} style={{
                            backgroundColor: "white", borderRadius: 16,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                            padding: "16px 20px", display: "flex", alignItems: "center", gap: 16
                        }}>
                            <div style={{ width: 80, textAlign: "center", flexShrink: 0 }}>
                                <div style={{ fontSize: 28 }}>{motor.icon}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginTop: 4 }}>
                                    {motor.label}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 12, flex: 1 }}>
                                {[motor.left, motor.right].map((btn) => {
                                    const isActive = activeCmd === btn.cmd;
                                    return (
                                        <button key={btn.cmd} onClick={() => handleClick(btn.cmd)} style={{
                                            flex: 1, padding: "14px 8px",
                                            backgroundColor: isActive ? "#15803d" : "#1d4ed8",
                                            color: "white",
                                            border: isActive ? "3px solid #166534" : "3px solid transparent",
                                            borderRadius: 12, fontSize: 14, fontWeight: 600,
                                            cursor: "pointer", userSelect: "none",
                                            transition: "background-color 0.15s"
                                        }}>
                                            {isActive ? "⏹ Aturar" : btn.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ManualControl;