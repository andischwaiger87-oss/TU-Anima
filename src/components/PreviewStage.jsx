import React from 'react';
import { cards } from '../data/cards';
import { Sparkles, FlaskConical, CheckCircle, XCircle } from 'lucide-react';

const PreviewStage = ({ selectionData, onGenerate, onSimulate }) => {

    const getCard = (id) => cards.find(c => c.id === id);

    const posFav1 = selectionData?.posFavs?.first ? getCard(selectionData.posFavs.first) : null;
    const posFav2 = selectionData?.posFavs?.second ? getCard(selectionData.posFavs.second) : null;
    const negFav1 = selectionData?.negFavs?.first ? getCard(selectionData.negFavs.first) : null;
    const negFav2 = selectionData?.negFavs?.second ? getCard(selectionData.negFavs.second) : null;

    const renderCard = (card, label, type) => {
        const isPos = type === 'pos';
        const color = isPos ? '#10b981' : '#ef4444'; // Green or Red
        const Icon = isPos ? CheckCircle : XCircle;

        return (
            <div className="preview-card-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 10 }}>
                {/* Card Container - Width Controlled by CSS */}
                <div className="preview-card-wrapper" style={{
                    position: 'relative',
                    borderRadius: '8px',
                    background: 'white',
                    padding: '10px',
                    boxShadow: `0 20px 50px -10px ${isPos ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, // Colored shadow
                }}>
                    <img src={card.image} alt={card.name} style={{ width: '100%', display: 'block' }} />

                    {/* Floating Indicator */}
                    <div style={{
                        position: 'absolute', top: -10, right: -10,
                        background: color, color: 'white', borderRadius: '50%',
                        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}>
                        <Icon size={18} />
                    </div>
                </div>

                {/* Label - High Contrast */}
                <span className="preview-card-label" style={{
                    background: 'black',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '50px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></span>
                    {label}
                </span>
            </div>
        );
    };

    return (
        <div style={{
            width: '100vw',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            // CSS Studio Background
            background: 'radial-gradient(circle at 50% 30%, #f3f3f3 0%, #d8d8d8 100%)',
            padding: '40px'
        }}>
            <style>{`
                /* Desktop Defaults */
                .preview-card-wrapper { width: 200px; }

                @media (max-width: 768px) {
                    .preview-header h1 { font-size: 2rem !important; }
                    .preview-header p { font-size: 1rem !important; margin-bottom: 40px !important; }
                    
                    /* Stack the Positive and Negative Groups vertically, BUT keep cards inside them side-by-side */
                    .preview-grid { flex-direction: column; gap: 40px !important; margin-bottom: 120px !important; /* Extra margin for sticky button */ }
                    
                    /* Ensure cards are side by side on mobile */
                    .preview-group { 
                        flex-direction: row !important; 
                        flex-wrap: nowrap !important; /* Force single row */
                        justify-content: center; 
                        gap: 15px !important; 
                    }
                    
                    /* Resize cards to fit side by side */
                    .preview-card-wrapper { 
                        width: 42vw !important; /* Ensure 2 fit */
                        max-width: 160px;
                        padding: 6px !important;
                    }
                    .preview-card-label {
                        font-size: 0.75rem !important;
                        padding: 6px 12px !important;
                    }

                    .preview-actions { flex-direction: column; width: 100%; }
                    .preview-actions button { width: 100%; justify-content: center; }
                    .preview-divider { display: none !important; }
                    
                    /* Hide valid desktop button on mobile */
                    .btn-reveal-desktop { display: none !important; }
                    
                    /* Show sticky button on mobile */
                    .btn-reveal-mobile-container { display: flex !important; }
                }

                @media (min-width: 769px) {
                    .btn-reveal-mobile-container { display: none !important; }
                }
            `}</style>

            <div className="preview-header" style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%', maxWidth: '1200px' }}>
                <h1 style={{ color: 'black', fontSize: '3rem', marginBottom: '10px', fontWeight: '800' }}>Deine Auswahl</h1>
                <p style={{ color: '#666', marginBottom: '80px', fontSize: '1.2rem' }}>Diese Favoriten formen dein Seelenbild.</p>

                {/* Cards Display */}
                <div className="preview-grid" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '40px',
                    marginBottom: '100px',
                }}>
                    {/* Positive Group */}
                    <div className="preview-group" style={{ display: 'flex', gap: '30px' }}>
                        {posFav1 && renderCard(posFav1, "Positiv 1", 'pos')}
                        {posFav2 && renderCard(posFav2, "Positiv 2", 'pos')}
                    </div>

                    <div className="preview-divider" style={{ width: '2px', background: '#ddd', margin: '0 20px' }}></div>

                    {/* Negative Group */}
                    <div className="preview-group" style={{ display: 'flex', gap: '30px' }}>
                        {negFav1 && renderCard(negFav1, "Negativ 1", 'neg')}
                        {negFav2 && renderCard(negFav2, "Negativ 2", 'neg')}
                    </div>
                </div>

                {/* Actions */}
                <div className="preview-actions" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>

                    <button
                        onClick={onSimulate}
                        style={{
                            padding: '15px 30px',
                            borderRadius: '50px',
                            border: '2px solid #ddd',
                            background: 'transparent',
                            color: '#666',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.2s',
                            marginBottom: '20px' // Spacer for mobile scrolling
                        }}
                        onMouseOver={e => { e.target.style.borderColor = 'black'; e.target.style.color = 'black'; }}
                        onMouseOut={e => { e.target.style.borderColor = '#ddd'; e.target.style.color = '#666'; }}
                    >
                        <FlaskConical size={20} />
                        Simulation (Demo)
                    </button>

                    {/* Desktop Reveal Button */}
                    <button
                        className="btn-reveal-desktop"
                        onClick={onGenerate}
                        style={{
                            padding: '15px 40px',
                            borderRadius: '50px',
                            border: 'none',
                            background: 'black',
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.target.style.transform = 'scale(1)'}
                    >
                        <Sparkles size={20} />
                        Seelenbild offenbaren
                    </button>

                </div>
            </div>

            {/* Mobile Sticky Reveal Button */}
            <div className="btn-reveal-mobile-container" style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                padding: '20px',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid #eee',
                zIndex: 1000,
                boxShadow: '0 -5px 20px rgba(0,0,0,0.05)',
                display: 'none', // Hidden on desktop
                justifyContent: 'center'
            }}>
                <button
                    onClick={onGenerate}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: 'black',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                    }}
                >
                    <Sparkles size={20} />
                    Seelenbild offenbaren
                </button>
            </div>
        </div>
    );
};

export default PreviewStage;
