import { useState } from "react";
import axios from "axios";
import Titol from "../components/Titol";

const NOM = "EV3_1";

const COLORS = [
    { id: "red",    label: "Vermell", bg: "#ef4444" },
    { id: "blue",   label: "Blau",    bg: "#3b82f6" },
    { id: "yellow", label: "Groc",    bg: "#eab308" },
];

const ConfiguracioRobot = ({ onIniciar }) => {
    const [numPeces, setNumPeces] = useState(1);
    const [colors, setColors]     = useState(["red", "red", "red"]);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");

    const handleColor = (index, color) => {
        const nouColors = [...colors];
        nouColors[index] = color;
        setColors(nouColors);
    };

    const handleIniciar = () => {
        const sequencia = colors.slice(0, numPeces);
        setLoading(true);
        setError("");
        // 1. Guardar seqüència, 2. Arrancar càmera, 3. Notificar parent
        axios.post("/api/EV3/setSequencia", { Nom: NOM, sequencia })
            .then(() => axios.post("/api/EV3/vision/start"))
            .then(() => onIniciar(sequencia))
            .catch(() => setError("Error configurant el robot. Torna-ho a intentar."))
            .finally(() => setLoading(false));
    };

    return (
        <>
            <Titol titol={"Configura el Robot"} noPadding={true} />
            <div style={{ padding: "24px 16px", maxWidth: 560, margin: "0 auto" }}>

                {/* Nombre de peces */}
                <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", padding: 24, marginBottom: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
                        Quantes peces ha d'agafar el robot?
                    </p>
                    <div style={{ display: "flex", gap: 12 }}>
                        {[1, 2, 3].map(n => (
                            <button
                                key={n}
                                onClick={() => setNumPeces(n)}
                                style={{
                                    flex: 1,
                                    padding: "20px 8px",
                                    backgroundColor: numPeces === n ? "#1d4ed8" : "#f3f4f6",
                                    color: numPeces === n ? "white" : "#374151",
                                    border: "none",
                                    borderRadius: 12,
                                    fontSize: 28,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    transition: "background-color 0.2s"
                                }}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color per cada peça */}
                <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", padding: 24, marginBottom: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
                        Color de cada peça
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {Array.from({ length: numPeces }).map((_, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#1d4ed8", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                                    {i + 1}
                                </div>
                                <div style={{ display: "flex", gap: 10, flex: 1 }}>
                                    {COLORS.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleColor(i, c.id)}
                                            style={{
                                                flex: 1,
                                                padding: "12px 8px",
                                                backgroundColor: c.bg,
                                                color: "white",
                                                border: colors[i] === c.id ? "3px solid #1f2937" : "3px solid transparent",
                                                borderRadius: 10,
                                                fontSize: 13,
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                opacity: colors[i] === c.id ? 1 : 0.6,
                                                transition: "opacity 0.2s, border 0.2s"
                                            }}
                                        >
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>



                {error && (
                    <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</p>
                )}

                <button
                    onClick={handleIniciar}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "16px",
                        backgroundColor: loading ? "#9ca3af" : "#22c55e",
                        color: "white",
                        border: "none",
                        borderRadius: 14,
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "background-color 0.2s"
                    }}
                >
                    {loading ? "Configurant..." : "▶ Iniciar Robot"}
                </button>
            </div>
        </>
    );
};

export default ConfiguracioRobot;