import React, { useState, useEffect, useRef } from 'react';
import { generateSoulCard } from '../services/openai'; // setApiKey & getApiKey entfernt
import { Download, RefreshCw } from 'lucide-react'; // Key Icon entfernt
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ResultEvaluation = ({ selectionData, isSimulation }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const resultRef = useRef(null);
    
    const [loadingTextIndex, setLoadingTextIndex] = useState(0);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setLoadingTextIndex(0);

        if (isSimulation) {
            setTimeout(() => {
                setResult({
                    imageUrl: '/cards/1-Lebensflamme.webp', // Mock Image
                    interpretation: "<h3>DEMO ANALYSE</h3><p>Dies ist ein Platzhalter-Text für den Demonstrationsmodus.</p>"
                });
                setLoading(false);
            }, 1500);
            return;
        }

        try {
            // Aufruf unserer neuen sicheren Backend-Logik
            const data = await generateSoulCard(selectionData);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            if (!isSimulation) setLoading(false);
        }
    };

    const downloadPDF = async () => {
        if (!resultRef.current) return;
        try {
            const element = resultRef.current;
            const canvas = await html2canvas(element, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = 210;
            const pdfHeight = 297;
            const margin = 15;
            
            const contentWidth = pdfWidth - (margin * 2);
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
            
            let heightLeft = imgHeight;
            let position = margin;

            pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
            heightLeft -= (pdfHeight - (margin * 2));

            while (heightLeft > 0) {
                position = heightLeft - imgHeight + margin; 
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
                heightLeft -= (pdfHeight - (margin * 2));
            }
            
            pdf.save('TU-Anima-Seelenkarte.pdf');
        } catch (e) {
            console.error("PDF Fail", e);
            alert("Fehler beim Erstellen des PDFs.");
        }
    };

    useEffect(() => {
        // Startet sofort, keine Key-Prüfung mehr nötig
        handleGenerate();
    }, []);

    useEffect(() => {
        let interval;
        if (loading) {
            interval = setInterval(() => {
                setLoadingTextIndex((prev) => (prev + 1) % 5);
            }, 8000);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const loadingTexts = [
        "Deine Archetypen werden tiefenpsychologisch analysiert...",
        "Spannungen und Ressourcen werden ausgewertet...",
        "Das visuelle Konzept deines Seelenbildes entsteht...",
        "Abstrakte Farb- und Formstrukturen werden berechnet...",
        "Letzte Pinselstriche der Öltextur werden aufgetragen..."
    ];

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 50%, #fafafa 0%, #ebebeb 100%)', padding: '20px' }}>
                <style>{`
                    @keyframes fadeText {
                        0% { opacity: 0; transform: translateY(5px); }
                        10% { opacity: 1; transform: translateY(0); }
                        90% { opacity: 1; transform: translateY(0); }
                        100% { opacity: 0; transform: translateY(-5px); }
                    }
                    .card-stack { position: relative; width: 60px; height: 90px; margin-bottom: 50px; perspective: 1000px; }
                    .anim-card { 
                        position: absolute; width: 100%; height: 100%; background: white; 
                        border: 2px solid #333; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        transform-origin: bottom center;
                    }
                    .anim-card-1 { animation: shuffle1 3s infinite ease-in-out; z-index: 1; }
                    .anim-card-2 { animation: shuffle2 3s infinite ease-in-out; z-index: 2; }
                    .anim-card-3 { animation: shuffle3 3s infinite ease-in-out; z-index: 3; }
                    
                    @keyframes shuffle1 { 0%, 100% { transform: translateX(0) rotate(0deg); } 50% { transform: translateX(-30px) rotate(-15deg); } }
                    @keyframes shuffle2 { 0%, 100% { transform: translateX(0) rotate(0deg); } 50% { transform: translateX(0px) rotate(0deg); } }
                    @keyframes shuffle3 { 0%, 100% { transform: translateX(0) rotate(0deg); } 50% { transform: translateX(30px) rotate(15deg); } }

                    .scanner {
                        position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(0, 0, 0, 0.5);
                        box-shadow: 0 0 8px 2px rgba(0,0,0,0.2); animation: scan 3s infinite linear;
                    }
                    @keyframes scan { 0% { top: 5%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 95%; opacity: 0; } }
                `}</style>

                <div className="card-stack">
                    <div className="anim-card anim-card-1"></div>
                    <div className="anim-card anim-card-2"></div>
                    <div className="anim-card anim-card-3">
                        <div className="scanner"></div>
                        <div style={{ width: '40%', height: '40%', border: '2px solid #ddd', borderRadius: '50%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
                    </div>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: '400', margin: '0 0 15px 0', letterSpacing: '1px', color: '#111', textAlign: 'center' }}>
                    Seelenbild wird erschaffen
                </h2>
                
                <div style={{ minHeight: '60px', width: '100%', maxWidth: '400px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <p key={loadingTextIndex} style={{ 
                         margin: 0, color: '#666', fontSize: '1.05rem', lineHeight: '1.5',
                         animation: 'fadeText 8s ease-in-out forwards'
                     }}>
                         {loadingTexts[loadingTextIndex]}
                     </p>
                </div>
                
                <p style={{ marginTop: '20px', fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    Dauer: ca. 45 - 60 Sekunden
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
                <h2 style={{ color: 'red' }}>Ein Fehler ist aufgetreten</h2>
                <p style={{ maxWidth: '400px', marginBottom: '20px' }}>
                    {error}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Zurück zum Start
                </button>
            </div>
        );
    }

    if (result) {
        return (
            <div className="result-container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <style>{`
                    .html-interpretation h3 { 
                        font-size: 1.3rem; 
                        color: #111; 
                        margin-top: 35px; 
                        margin-bottom: 10px; 
                        border-bottom: 1px solid #eee; 
                        padding-bottom: 8px; 
                        text-transform: uppercase; 
                        letter-spacing: 1px; 
                        
                        page-break-inside: avoid;
                        break-inside: avoid;
                        page-break-after: avoid;
                        break-after: avoid;
                    }
                    .html-interpretation h3:first-child { margin-top: 0; }
                    
                    .html-interpretation p { 
                        line-height: 1.8; 
                        color: #444; 
                        font-size: 1.1rem; 
                        margin-bottom: 20px; 
                        
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    
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

                <div ref={resultRef} className="result-card-inner" style={{ background: 'white', padding: '60px 40px', borderRadius: '8px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
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
                                    src={
                                        result.imageUrl 
                                        ? (result.imageUrl.startsWith('http') || result.imageUrl.startsWith('/') || result.imageUrl.startsWith('data:') 
                                            ? result.imageUrl 
                                            : `data:image/png;base64,${result.imageUrl}`)
                                        : ""
                                    }
                                    alt="Seelenkarte"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        </div>

                        <div style={{ width: '100%', maxWidth: '800px', textAlign: 'left' }}>
                            {isSimulation && <h3 style={{ color: 'red', marginBottom: '20px' }}>DEMO ANALYSE (Simulation)</h3>}
                            
                            <div 
                                className="html-interpretation"
                                dangerouslySetInnerHTML={{ __html: result.interpretation }} 
                            />
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