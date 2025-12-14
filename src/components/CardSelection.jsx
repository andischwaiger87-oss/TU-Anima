import React, { useState, useMemo } from 'react';
import { cards } from '../data/cards';
import { CheckCircle, XCircle, Star, Info, ChevronRight, Maximize2 } from 'lucide-react';
import CardShowcase from './CardShowcase';
import FAQ from './FAQ';
import '../styles/variables.css';

const MAX_SELECTION = 6;

const CardSelection = ({ onComplete }) => {
    // Phases: 'pos_selection' -> 'pos_favorites' -> 'neg_selection' -> 'neg_favorites'
    const [phase, setPhase] = useState('pos_selection');

    // Selection State
    const [posCards, setPosCards] = useState(new Set());
    const [negCards, setNegCards] = useState(new Set());
    const [posFavs, setPosFavs] = useState({ first: null, second: null });
    const [negFavs, setNegFavs] = useState({ first: null, second: null });

    // UI State
    const [showcaseCard, setShowcaseCard] = useState(null);
    const [showFAQ, setShowFAQ] = useState(false);

    // Helper to get remaining count
    const posCount = posCards.size;
    const negCount = negCards.size;

    // --- Logic ---

    const handleCardClick = (card) => {
        // If in showcase mode, do nothing (overlay handles it)

        // Logic depends on Phase
        if (phase === 'pos_selection') {
            const newSet = new Set(posCards);
            if (newSet.has(card.id)) {
                newSet.delete(card.id);
            } else {
                if (newSet.size < MAX_SELECTION) {
                    newSet.add(card.id);
                }
            }
            setPosCards(newSet);
        }
        else if (phase === 'pos_favorites') {
            // Must be one of the selected positive cards
            if (!posCards.has(card.id)) return;

            // Toggle logic for 1st and 2nd favorite
            // If already 1st, remove. If already 2nd, remove.
            // If free, assign to 1st if empty, else 2nd.
            if (posFavs.first === card.id) {
                setPosFavs({ ...posFavs, first: null });
            } else if (posFavs.second === card.id) {
                setPosFavs({ ...posFavs, second: null });
            } else {
                if (!posFavs.first) setPosFavs({ ...posFavs, first: card.id });
                else if (!posFavs.second) setPosFavs({ ...posFavs, second: card.id });
            }
        }
        else if (phase === 'neg_selection') {
            // Cannot select cards that were already selected as positive
            if (posCards.has(card.id)) return;

            const newSet = new Set(negCards);
            if (newSet.has(card.id)) {
                newSet.delete(card.id);
            } else {
                if (newSet.size < MAX_SELECTION) {
                    newSet.add(card.id);
                }
            }
            setNegCards(newSet);
        }
        else if (phase === 'neg_favorites') {
            if (!negCards.has(card.id)) return;

            if (negFavs.first === card.id) {
                setNegFavs({ ...negFavs, first: null });
            } else if (negFavs.second === card.id) {
                setNegFavs({ ...negFavs, second: null });
            } else {
                if (!negFavs.first) setNegFavs({ ...negFavs, first: card.id });
                else if (!negFavs.second) setNegFavs({ ...negFavs, second: card.id });
            }
        }
    };

    const handleShowcase = (e, card) => {
        e.stopPropagation(); // Don't trigger selection
        setShowcaseCard(card);
    };

    const canProceed = () => {
        if (phase === 'pos_selection') return posCount === MAX_SELECTION;
        if (phase === 'pos_favorites') return posFavs.first && posFavs.second;
        if (phase === 'neg_selection') return negCount === MAX_SELECTION;
        if (phase === 'neg_favorites') return negFavs.first && negFavs.second;
        return false;
    };

    const nextPhase = () => {
        if (!canProceed()) return;

        if (phase === 'pos_selection') setPhase('pos_favorites');
        else if (phase === 'pos_favorites') setPhase('neg_selection');
        else if (phase === 'neg_selection') setPhase('neg_favorites');
        else if (phase === 'neg_favorites') {
            // Complete!
            onComplete({
                posCards: Array.from(posCards),
                negCards: Array.from(negCards),
                posFavs,
                negFavs
            });
        }
    };

    // --- Render Helpers ---

    const getCardStatus = (id) => {
        const isPos = posCards.has(id);
        const isNeg = negCards.has(id);

        if (!isPos && !isNeg) return 'neutral';

        if (isPos) {
            if (posFavs.first === id) return 'pos_fav_1';
            if (posFavs.second === id) return 'pos_fav_2';
            return 'pos';
        }
        if (isNeg) {
            if (negFavs.first === id) return 'neg_fav_1';
            if (negFavs.second === id) return 'neg_fav_2';
            return 'neg';
        }
        return 'neutral';
    };

    const getInstruction = () => {
        switch (phase) {
            case 'pos_selection': return `Wähle ${MAX_SELECTION} Karten, die dich positiv ansprechen. (${posCount}/${MAX_SELECTION})`;
            case 'pos_favorites': return "Wähle deinen 1. und 2. Favoriten aus den grünen Karten.";
            case 'neg_selection': return `Wähle ${MAX_SELECTION} Karten, die dich negativ abstoßen. (${negCount}/${MAX_SELECTION})`;
            case 'neg_favorites': return "Wähle deinen 1. und 2. Favoriten aus den roten Karten.";
            default: return "";
        }
    };

    return (
        <div className="selection-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <style>{`
                .selection-container {
                    padding: 80px 20px 100px 20px;
                }
                @media (max-width: 768px) {
                    .selection-container {
                        padding-top: 130px; /* Increased from 80px for mobile header */
                    }
                }
            `}</style>
            {/* Header */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%',
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
                zIndex: 100, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                gap: '20px' // Added gap
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>TU-Anima Bildertest</h2>
                    <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#555' }}>{getInstruction()}</div>
                </div>
                <button onClick={() => setShowFAQ(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}><Info /></button>
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '20px',
                paddingTop: '20px'
            }}>
                {cards.map(card => {
                    const status = getCardStatus(card.id);
                    const isSelected = status !== 'neutral';
                    const isDisabled = (phase === 'neg_selection' || phase === 'neg_favorites') && posCards.has(card.id);
                    const isInteractive = !isDisabled;

                    // Visual Styles
                    let borderColor = 'transparent';
                    let overlayIcon = null;
                    let opacity = isInteractive ? 1 : 0.4;

                    if (status === 'pos') {
                        borderColor = 'var(--color-success)';
                        overlayIcon = <CheckCircle color="var(--color-success)" fill="white" size={32} />;
                    } else if (status === 'pos_fav_1') {
                        borderColor = 'var(--color-gold)';
                        overlayIcon = <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Star color="var(--color-gold)" fill="var(--color-gold)" size={48} /><span style={{ color: 'black', fontSize: '13px', background: 'white', padding: '4px 10px', borderRadius: '12px', marginTop: '-12px', fontWeight: '800', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>1. Favorit</span></div>;
                    } else if (status === 'pos_fav_2') {
                        borderColor = 'var(--color-gold)';
                        overlayIcon = <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Star color="var(--color-gold)" fill="var(--color-gold)" size={36} /><span style={{ color: 'black', fontSize: '13px', background: 'white', padding: '4px 10px', borderRadius: '12px', marginTop: '-12px', fontWeight: '800', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>2. Favorit</span></div>;
                    } else if (status === 'neg') {
                        borderColor = 'var(--color-error)';
                        overlayIcon = <XCircle color="var(--color-error)" fill="white" size={32} />;
                    } else if (status === 'neg_fav_1') {
                        borderColor = 'var(--color-error)'; // Keep red border but star icon? User said star.
                        overlayIcon = <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Star color="var(--color-error)" fill="var(--color-error)" size={48} /><span style={{ color: 'black', fontSize: '13px', background: 'white', padding: '4px 10px', borderRadius: '12px', marginTop: '-12px', fontWeight: '800', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>1. Favorit</span></div>;
                    } else if (status === 'neg_fav_2') {
                        borderColor = 'var(--color-error)';
                        overlayIcon = <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Star color="var(--color-error)" fill="var(--color-error)" size={36} /><span style={{ color: 'black', fontSize: '13px', background: 'white', padding: '4px 10px', borderRadius: '12px', marginTop: '-12px', fontWeight: '800', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>2. Favorit</span></div>;
                    }

                    return (
                        <div
                            key={card.id}
                            onClick={() => isInteractive && handleCardClick(card)}
                            style={{
                                position: 'relative',
                                cursor: isInteractive ? 'pointer' : 'default',
                                opacity,
                                transition: 'transform 0.2s',
                                transform: isSelected ? 'scale(0.95)' : 'scale(1)',
                                border: `4px solid ${borderColor}`,
                                borderRadius: '8px',
                                overflow: 'hidden',
                                // New Shadow
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            }}
                        >
                            <img src={card.image} alt={card.name} style={{ width: '100%', height: 'auto', display: 'block' }} loading="lazy" />

                            {/* Overlay Icon */}
                            {isSelected && (
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.2)'
                                }}>
                                    {overlayIcon}
                                </div>
                            )}

                            {/* Showcase Trigger */}
                            <button
                                onClick={(e) => handleShowcase(e, card)}
                                style={{
                                    position: 'absolute', top: '5px', left: '5px',
                                    background: 'white', borderRadius: '50%', border: 'none',
                                    width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)', cursor: 'pointer', opacity: 0.8
                                }}
                            >
                                <Maximize2 size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Footer Action */}
            <div style={{
                position: 'fixed', bottom: '30px', right: '30px', zIndex: 100
            }}>
                <button
                    onClick={nextPhase}
                    disabled={!canProceed()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '16px 32px',
                        borderRadius: '50px',
                        border: 'none',
                        backgroundColor: canProceed() ? 'black' : '#ccc',
                        color: 'white',
                        fontSize: '1.2rem',
                        cursor: canProceed() ? 'pointer' : 'not-allowed',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                >
                    {phase === 'neg_favorites' ? 'Abschließen' : 'Weiter'} <ChevronRight />
                </button>
            </div>

            {/* Showcase Modal */}
            {showcaseCard && (
                <CardShowcase card={showcaseCard} onClose={() => setShowcaseCard(null)} />
            )}

            {/* FAQ Modal */}
            {showFAQ && (
                <FAQ onClose={() => setShowFAQ(false)} />
            )}
        </div>
    );
};

export default CardSelection;
