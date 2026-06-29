import { useEffect, useCallback, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Titol from "../components/Titol";

const NOM = "EV3_1";

const COMANDOS = [
    { paraula: "esquerra",       accio: "Mou la base cap a l'esquerra" },
    { paraula: "dreta",          accio: "Mou la base cap a la dreta" },
    { paraula: "puja espatlla",  accio: "Puja l'espatlla" },
    { paraula: "baixa espatlla", accio: "Baixa l'espatlla" },
    { paraula: "puja colze",     accio: "Puja el colze" },
    { paraula: "baixa colze",    accio: "Baixa el colze" },
    { paraula: "obrir",          accio: "Obre la pinça" },
    { paraula: "tancar",         accio: "Tanca la pinça" },
    { paraula: "para",           accio: "Atura qualsevol moviment" },
];

const VOICE_COMMANDS = {
    "esquerra":      "base_left",
    "dreta":         "base_right",
    "puja espatlla": "shoulder_up",
    "baixa espatlla":"shoulder_down",
    "puja colze":    "elbow_up",
    "baixa colze":   "elbow_down",
    "obrir":         "gripper_open",
    "tancar":        "gripper_close",
    "para":          "STOP",
    "stop":          "STOP",
};

const ControlVeu = () => {
    const params = useParams();
    const [voiceActive, setVoiceActive] = useState(false);
    const [lastWord, setLastWord]       = useState("");
    const [lastCmd, setLastCmd]         = useState("");
    const [noEntes, setNoEntes]         = useState(false);
    const recognitionRef = useRef(null);
    const noEntesTimeout  = useRef(null);

    const sendCmd = useCallback((cmd) => {
        axios.post("/api/EV3/manualMove", { Nom: NOM, cmd }).catch(console.error);
    }, []);

    // Activar mode Manual al servidor (el robot escolta comandes) 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        axios.post("/api/EV3/nouEstat", {
            id_EV3: params.ev3_id,
            Manual: 1, Automatic: 0, "Pinça": 0,
            llista_moviments: [], cx: 0, user_email: ""
        }).catch(console.error);

        return () => {
            recognitionRef.current?.recognition.stop();
            axios.post("/api/EV3/nouEstat", {
                id_EV3: params.ev3_id,
                Manual: 0, Automatic: 0, "Pinça": 0,
                llista_moviments: [], cx: 0, user_email: ""
            }).catch(console.error);
            sendCmd("STOP");
        };
    }, []);

    //Configurar reconeixement de veu 
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = "ca-ES";
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript
                .toLowerCase().trim();
            setLastWord(transcript);

            let trobat = false;
            for (const [paraula, cmd] of Object.entries(VOICE_COMMANDS)) {
                if (transcript.includes(paraula)) {
                    sendCmd(cmd);
                    setLastCmd(cmd);
                    trobat = true;
                    break;
                }
            }

            if (!trobat) {
                setLastCmd("");
                setNoEntes(true);
                clearTimeout(noEntesTimeout.current);
                noEntesTimeout.current = setTimeout(() => setNoEntes(false), 3000);
            } else {
                setNoEntes(false);
            }
        };

        recognition.onerror = (e) => {
            if (e.error !== "no-speech") console.error("Veu error:", e.error);
        };

        recognition.onend = () => {
            if (recognitionRef.current?.active) {
                recognition.start();
            }
        };

        recognitionRef.current = { recognition, active: false };

        return () => {
            recognition.stop();
            clearTimeout(noEntesTimeout.current);
        };
    }, [sendCmd]);

    const toggleVoice = () => {
        const ref = recognitionRef.current;
        if (!ref) return;
        if (!voiceActive) {
            ref.active = true;
            ref.recognition.start();
            setVoiceActive(true);
        } else {
            ref.active = false;
            ref.recognition.stop();
            setVoiceActive(false);
            setLastWord("");
            setLastCmd("");
            setNoEntes(false);
        }
    };

    return (
        <div style={{ padding: "24px 16px", maxWidth: 640, margin: "0 auto" }}>
            <Titol titol={"Control per Veu"} noPadding={true} />

            {/* Botó micròfon + estat */}
            <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", padding: 24, marginTop: 20, textAlign: "center" }}>
                <button
                    onClick={toggleVoice}
                    style={{
                        backgroundColor: voiceActive ? "#ef4444" : "#1d4ed8",
                        color: "white",
                        border: "none",
                        borderRadius: 999,
                        width: 96,
                        height: 96,
                        fontSize: 36,
                        cursor: "pointer",
                        boxShadow: voiceActive ? "0 0 0 8px rgba(239,68,68,0.15)" : "0 2px 8px rgba(0,0,0,0.15)",
                        transition: "box-shadow 0.3s, background-color 0.2s"
                    }}
                >
                    🎤
                </button>

                <p style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: voiceActive ? "#15803d" : "#6b7280" }}>
                    {voiceActive ? "Escoltant..." : "Prem per activar el micròfon"}
                </p>

                {voiceActive && (
                    <div style={{ marginTop: 16, minHeight: 50 }}>
                        {lastCmd ? (
                            <p style={{ fontSize: 14, color: "#15803d", fontWeight: 600 }}>
                                ✅ "{lastWord}" → {lastCmd}
                            </p>
                        ) : noEntes ? (
                            <p style={{ fontSize: 14, color: "#ef4444", fontWeight: 600 }}>
                                ❓ No t'he entès. Torna a dir l'ordre, si us plau.
                            </p>
                        ) : lastWord ? (
                            <p style={{ fontSize: 14, color: "#9ca3af" }}>"{lastWord}"</p>
                        ) : (
                            <p style={{ fontSize: 13, color: "#9ca3af" }}>Digues una ordre...</p>
                        )}
                    </div>
                )}
            </div>

            {/* Taula de comandos */}
            <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", padding: 20, marginTop: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
                    Comandos disponibles
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {COMANDOS.map((c) => {
                        const isActive = voiceActive && lastCmd === VOICE_COMMANDS[c.paraula];
                        return (
                            <div
                                key={c.paraula}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "10px 14px",
                                    backgroundColor: isActive ? "#dcfce7" : "#f9fafb",
                                    borderRadius: 10,
                                    border: isActive ? "2px solid #22c55e" : "2px solid transparent",
                                    transition: "background-color 0.2s, border 0.2s"
                                }}
                            >
                                <span style={{ fontWeight: 700, fontSize: 14, color: "#1d4ed8" }}>
                                    "{c.paraula}"
                                </span>
                                <span style={{ fontSize: 13, color: "#6b7280", textAlign: "right" }}>
                                    {c.accio}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ControlVeu;
