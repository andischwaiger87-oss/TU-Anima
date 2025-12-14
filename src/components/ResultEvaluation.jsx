import React, { useState, useEffect, useRef } from 'react';
import { generateSoulCard, setApiKey, getApiKey } from '../services/openai';
import { Download, RefreshCw, Key } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ResultEvaluation = ({ selectionData, isSimulation }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const resultRef = useRef(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);

        // Check for Simulation Mode
        if (isSimulation) {
            // Mock Delay
            setTimeout(() => {
                setResult({
                    imageUrl: '/assets/Individuelles Seelenbild-mock.webp',
                    interpretation: "DEMO ANALYSE (Simulation):\n\nDeine Wahl zeigt eine starke Fokussierung auf Wachstum und Transformation (Lebensflamme, Springer). Gleichzeitig deuten die negativen Wahlkarten auf eine Ablehnung von Starrheit hin.\n\nDies ist ein Platzhalter-Text für den Demonstrationsmodus."
                });
                setLoading(false);
            }, 1500);
            return;
        }

        try {
            const data = await generateSoulCard(selectionData);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            if (!isSimulation) setLoading(false);
        }
    };

    const saveKeyAndRetry = () => {
        if (apiKeyInput) {
            setApiKey(apiKeyInput);
            handleGenerate();
        }
    };

    const downloadPDF = async () => {
        if (!resultRef.current) return;

        try {
            const element = resultRef.current;
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save('TU-Anima-Seelenkarte.pdf');
        } catch (e) {
            console.error("PDF Fail", e);
            alert("Fehler beim Erstellen des PDFs.");
        }
    };

    useEffect(() => {
        if (isSimulation) {
            handleGenerate();
        } else if (getApiKey()) {
            handleGenerate();
        } else {
            setError("API Key missing");
        }
    }, []);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '20px' }}>Deine Seelenkarte wird generiert...</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Das kann bis zu 30 Sekunden dauern.</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error === "API Key missing" || (error && error.includes("401"))) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
                <Key size={48} style={{ marginBottom: '20px' }} />
                <h2>API Key benötigt</h2>
                <p style={{ maxWidth: '400px', marginBottom: '20px' }}>
                    Um die KI-Funktionen (ChatGPT 4o & DALL-E 3) zu nutzen, wird ein OpenAI API Key benötigt.
                    Dieser wird lokal in deinem Browser gespeichert.
                </p>
                <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-..."
                    style={{ padding: '10px', width: '300px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '10px' }}
                />
                <button
                    onClick={saveKeyAndRetry}
                    style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Speichern & Starten
                </button>
            </div>
        );
    }

    if (result) {
        return (
            <div className="result-container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <style>{`
                    @media (max-width: 768px) {
                        .result-container { padding: 20px 10px !important; }
                        .result-card-inner { padding: 20px !important; }
                        .result-header h1 { font-size: 2rem !important; }
                        .result-content { gap: 30px !important; }
                        /* Compact Layout: Make image smaller on mobile */
                        .result-img-wrapper { max-width: 250px !important; }
                        .result-actions { flex-direction: column; width: 100%; }
                        .result-actions button { width: 100%; justify-content: center; }
                    }
                `}</style>

                {/* PDF Content Area */}
                <div ref={resultRef} className="result-card-inner" style={{ background: 'white', padding: '40px', borderRadius: '8px', width: '100%' }}>
                    <div className="result-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h1 style={{ marginBottom: '10px' }}>Deine Seelenkarte</h1>
                        <p style={{ color: '#666' }}>TU-Anima Bildertest Ergebnis</p>
                    </div>

                    <div className="result-content" style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center', width: '100%' }}>

                        {/* Image - Portrait - Smaller Width requested */}
                        <div className="result-img-wrapper" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', transition: 'max-width 0.3s' }}>
                            <div style={{
                                width: '100%',
                                // Removing 100% padding bottom to allow natural height or changing aspect ratio
                                // 1024x1792 = ~1.75 aspect ratio
                                aspectRatio: '1024 / 1792',
                                position: 'relative',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.15)', borderRadius: '8px', overflow: 'hidden'
                            }}>
                                <img
                                    src={result.imageUrl}
                                    alt="Seelenkarte"
                                    crossOrigin="anonymous"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        </div>

                        {/* Text */}
                        <div style={{ width: '100%', maxWidth: '800px' }}>
                            <h3 style={{ fontSize: '1.2rem', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                {isSimulation ? "DEMO ANALYSE (Simulation):" : "Deine Persönliche Analyse:"}
                            </h3>
                            {/* CHANGED: textAlign: 'left' from 'justify' */}
                            <div style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#333', fontSize: '1.1rem', textAlign: 'left' }}>
                                {result.interpretation}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>
                        Erstellt mit TU-Anima
                    </div>
                </div>

                {/* Actions - Outside PDF Area */}
                <div className="result-actions" style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
                    <button
                        onClick={downloadPDF}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'black', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '1rem' }}
                    >
                        <Download size={18} /> Als PDF speichern
                    </button>

                    <button onClick={() => window.location.reload()} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'white', color: 'black', border: '1px solid #ddd', borderRadius: '50px', cursor: 'pointer', fontSize: '1rem' }}>
                        <RefreshCw size={18} /> Neuen Test starten
                    </button>
                </div>
            </div>
        );
    }

    return <div>Unbekannter Status</div>;
};

export default ResultEvaluation;
