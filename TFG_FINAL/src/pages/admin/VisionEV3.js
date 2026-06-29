import { useState, useEffect } from "react";
import axios from "axios";

const NOM = "EV3_1";
const STREAM_URL = "/stream";

const TIPUS_LABEL = {
    P:      { text: "Peça detectada",  color: "#4ade80" },
    B:      { text: "Caixa detectada", color: "#60a5fa" },
    SEARCH: { text: "Buscant...",      color: "#facc15" },
};

const colorButtons = [
    { id: "red",    label: "Vermell", bg: "#ef4444" },
    { id: "blue",   label: "Blau",    bg: "#3b82f6" },
    { id: "yellow", label: "Groc",    bg: "#eab308" },
];

const VisionEV3 = () => {
    const [vision, setVision]     = useState({ tipus: "SEARCH", cx: 0, cy: 0, area: 0 });
    const [color, setColor]       = useState("red");
    const [streamOk, setStreamOk] = useState(true);
    const [running, setRunning]   = useState(false);
    const [loading, setLoading]   = useState(false);

    // Consulta getVision
    useEffect(() => {
        const interval = setInterval(() => {
            axios.post("/api/EV3/getVision", { Nom: NOM })
                .then(res => setVision(res.data))
                .catch(err => console.error("getVision:", err));
        }, 300);
        return () => clearInterval(interval);
    }, []);

    // Color i estat inicial
    useEffect(() => {
        axios.post("/api/EV3/getColor", { Nom: NOM })
            .then(res => setColor(res.data.color || "red"))
            .catch(err => console.error("getColor:", err));

        axios.get("/api/EV3/vision/status")
            .then(res => setRunning(res.data.running))
            .catch(err => console.error("statusVision:", err));
    }, []);

    const handleSetColor = (newColor) => {
        axios.post("/api/EV3/setColor", { Nom: NOM, color: newColor })
            .then(() => setColor(newColor))
            .catch(err => console.error("setColor:", err));
    };

    const handleToggleVision = () => {
        setLoading(true);
        const endpoint = running ? "/api/EV3/vision/stop" : "/api/EV3/vision/start";
        axios.post(endpoint)
            .then(() => setRunning(!running))
            .catch(err => console.error("toggleVision:", err))
            .finally(() => setLoading(false));
    };

    const tipus = TIPUS_LABEL[vision.tipus] || TIPUS_LABEL["SEARCH"];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Títol + botó control */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: "bold", color: "#1f2937" }}>Visió Artificial</h1>
                    <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>Control de la càmera i detecció de peces — EV3_1</p>
                </div>
                <button
                    onClick={handleToggleVision}
                    disabled={loading}
                    style={{
                        backgroundColor: running ? "#ef4444" : "#22c55e",
                        color: "white",
                        border: "none",
                        borderRadius: 12,
                        padding: "10px 24px",
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "background-color 0.2s"
                    }}
                >
                    {loading ? "..." : running ? "⏹ Aturar càmera" : "▶ Iniciar càmera"}
                </button>
            </div>

            <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

                {/* Stream càmera */}
                <div style={{ flex: 2, minWidth: 300, backgroundColor: "white", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", padding: 16 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Feed Càmera</p>
                    <div style={{ backgroundColor: "#111827", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", position: "relative" }}>
                        {!running ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", gap: 8, minHeight: 240 }}>
                                <p style={{ fontSize: 14 }}>Càmera aturada</p>
                                <p style={{ fontSize: 12 }}>Prem "Iniciar càmera" per activar</p>
                            </div>
                        ) : streamOk ? (
                            <img
                                src={STREAM_URL}
                                alt="Stream càmera"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={() => setStreamOk(false)}
                            />
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", gap: 8, minHeight: 240 }}>
                                <p style={{ fontSize: 14 }}>Stream no disponible</p>
                                <button
                                    onClick={() => setStreamOk(true)}
                                    style={{ fontSize: 12, color: "#60a5fa", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Panell dret */}
                <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Estat detecció */}
                    <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", padding: 20 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Estat Detecció</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: tipus.color, display: "inline-block" }}></span>
                            <span style={{ fontWeight: 500, color: "#1f2937" }}>{tipus.text}</span>
                        </div>
                    </div>

                    {/* Selector color */}
                    <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", padding: 20 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Color Objectiu</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {colorButtons.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => handleSetColor(c.id)}
                                    style={{
                                        backgroundColor: c.bg,
                                        color: "white",
                                        border: color === c.id ? "3px solid #1f2937" : "3px solid transparent",
                                        borderRadius: 12,
                                        padding: "10px 16px",
                                        fontWeight: 600,
                                        fontSize: 14,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        opacity: color === c.id ? 1 : 0.7,
                                        transition: "opacity 0.2s, border 0.2s"
                                    }}
                                >
                                    <span>{c.label}</span>
                                    {color === c.id && (
                                        <svg style={{ width: 16, height: 16 }} fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd"/>
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default VisionEV3;