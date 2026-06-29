import React, { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Titol from '../components/Titol'

const STREAM_URL = "http://192.168.4.1:5000/stream";

function Treballant() {
    const [streamOk, setStreamOk] = useState(true);

    return (
        <>
            <Titol titol={"Robot treballant!"} noPadding={true} />
            <div className='container mx-auto'>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 40, marginTop: 48, flexWrap: "wrap" }}>

                    {/*GIF*/}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                        <LazyLoadImage effect="blur" src="/treballant.gif" />
                    </div>

                    {/*Càmera */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>
                            Visió del Robot
                        </p>
                        <div style={{
                            width: 320,
                            aspectRatio: "4/3",
                            backgroundColor: "#111827",
                            borderRadius: 16,
                            overflow: "hidden",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                        }}>
                            {streamOk ? (
                                <img
                                    src={STREAM_URL}
                                    alt="Visió càmera robot"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={() => setStreamOk(false)}
                                />
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", gap: 8 }}>
                                    <p style={{ fontSize: 13 }}>Càmera no disponible</p>
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

                </div>
            </div>
        </>
    )
}

export default Treballant