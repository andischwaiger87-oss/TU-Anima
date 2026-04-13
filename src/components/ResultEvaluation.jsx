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
    
    // State für den wechselnden Lade-Text
    const [loadingTextIndex, setLoadingTextIndex] = useState(0);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setLoadingTextIndex(0); // Text-Index zurücksetzen

        if (isSimulation) {
            setTimeout(() => {
                setResult({
                    imageUrl: '/assets/Individuelles Seelenbild-mock.webp',
                    interpretation: "DEMO ANALYSE (Simulation):\n\nDeine Wahl zeigt eine starke Fokussierung auf Wachstum und Transformation. Dies ist ein Platzhalter-Text für den Demonstrationsmodus."
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

    // Effekt für den initialen Start
    useEffect(() => {
        if (isSimulation) {
            handleGenerate();
        } else if (getApiKey()) {
            handleGenerate();
        } else {
            setError("API Key missing");
        }
    }, []);

    // Effekt für den rotierenden Text während dem Laden
    useEffect(() => {
        let interval;
        if (loading) {
            interval = setInterval(() => {
                setLoadingTextIndex((prev) => (prev + 1) % 5);
            }, 8000); // Alle 8 Sekunden ändert sich der Text
        }
        return () => clearInterval(interval);
    }, [loading]);

    // Die Texte für die Lade-Animation
    const loadingTexts = [
        "Deine Archetypen werden tiefenpsychologisch analysiert...",
        "Spannungen und Ressourcen werden ausgewertet...",
        "Das visuelle Konzept deines Seelenbildes entsteht...",
        "Abstrakte Farb- und Formstrukturen werden berechnet...",
        "Letzte Pinselstriche der Öltextur werden aufgetragen..."
    ];

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 50%, #fafafa 0%, #ebebeb 100%)' }}>
                <style>{`
                    @keyframes pulseOrb {
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1); }
                        50% { transform: scale(1.05); box-shadow: 0 0 40px 10px rgba(0, 0, 0, 0.08); }
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1); }
                    }
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                        100% { transform: translateY(0px); }
                    }
                    @keyframes fadeText {
                        0% { opacity: 0; transform: translateY(10px); }
                        10% { opacity: 1; transform: translateY(0); }
                        90% { opacity: 1; transform: translateY(0); }
                        100% { opacity: 0; transform: translateY(-10px); }
                    }
                `}</style>

                {/* Pulsierender Energie-Kern */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #222 0%, #555 100%)',
                    animation: 'pulseOrb 3s ease-in-out infinite, float 4s ease-in-out infinite',
                    marginBottom: '50px',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute', inset: '4px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                        background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)'
                    }}></div>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: '400', margin: '0 0 15px 0', letterSpacing: '1px', color: '#111' }}>
                    Seelenbild wird erschaffen
                </h2>
                
                {/* Rotierender Text */}
                <div style={{ height: '30px', overflow: 'hidden', position: 'relative', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                     <p key={loadingTextIndex} style={{ 
                         margin: 0, color: '#666', fontSize: '1.05rem',
                         animation: 'fadeText 8s ease-in-out forwards'
                     }}>
                         {loadingTexts[loadingTextIndex]}
                     </p>
                </div>
                
                <p style={{ marginTop: '40px', fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    Dauer: ca. 45 - 60 Sekunden
                </p>
            </div>
        );
    }

    if (error === "API Key missing" || (error && error.includes("401"))) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
                <Key size={48} style={{ marginBottom: '20px' }} />
                <h2>API Key benötigt</h2>
                <p style={{ maxWidth: '400px', marginBottom: '20px' }}>
                    Um die KI-Funktionen zu nutzen, wird ein OpenAI API Key benötigt.
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
                        .result-img-wrapper { max-width: 250px !important; }
                        .result-actions { flex-direction: column; width: 100%; }
                        .result-actions button { width: 100%; justify-content: center; }
                    }
                `}</style>

                <div ref={resultRef} className="result-card-inner" style={{ background: 'white', padding: '40px', borderRadius: '8px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                    <div className="result-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ marginBottom: '10px', fontSize: '2.5rem' }}>Deine Seelenkarte</h1>
                        <p style={{ color: '#666', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>TU-Anima Bildertest Ergebnis</p>
                    </div>

                    <div className="result-content" style={{ display: 'flex', flexDirection: 'column', gap: '50px', alignItems: 'center', width: '100%' }}>
                        <div className="result-img-wrapper" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                            <div style={{
                                width: '100%',
                                aspectRatio: '1024 / 1792',
                                position: 'relative',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.2)', 
                                borderRadius: '4px', 
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={result.imageUrl}
                                    alt="Seelenkarte"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        </div>

                        <div style={{ width: '100%', maxWidth: '800px' }}>
                            <h3 style={{ fontSize: '1.2rem', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                {isSimulation ? "DEMO ANALYSE (Simulation):" : "Deine Persönliche Analyse:"}
                            </h3>
                            <div style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#333', fontSize: '1.1rem', textAlign: 'left' }}>
                                {result.interpretation}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>
                        Erstellt mit TU-Anima
                    </div>
                </div>

                <div className="result-actions" style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
                    <button
                        onClick={downloadPDF}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 30px', background: 'black', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '1.05rem', fontWeight: '500', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Download size={20} /> Als PDF speichern
                    </button>

                    <button 
                        onClick={() => window.location.reload()} 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 30px', background: 'white', color: 'black', border: '1px solid #ddd', borderRadius: '50px', cursor: 'pointer', fontSize: '1.05rem', fontWeight: '500', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseOut={e => e.currentTarget.style.background = 'white'}
                    >
                        <RefreshCw size={20} /> Neuen Test starten
                    </button>
                </div>
            </div>
        );
    }

    return <div>Unbekannter Status</div>;
};

export default ResultEvaluation;