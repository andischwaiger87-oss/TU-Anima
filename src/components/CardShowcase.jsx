import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, HelpCircle } from 'lucide-react';
import { cards } from '../data/cards';

const CardShowcase = ({ card: initialCard, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        // Find index of initial card
        const idx = cards.findIndex(c => c.id === initialCard.id);
        if (idx !== -1) setCurrentIndex(idx);

        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [initialCard]);

    // Handle slide change
    const goToNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % cards.length);
        setIsPlaying(false);
    };

    const goToPrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        setIsPlaying(false);
    };

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const card = cards[currentIndex];

    if (!card) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            background: 'radial-gradient(circle at 50% 30%, #f9f9f9 0%, #e0e0e0 100%)',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                
                /* Randomized EQ Animations */
                @keyframes eq-1 { 0%, 100% { height: 3px; } 50% { height: 12px; } }
                @keyframes eq-2 { 0%, 100% { height: 3px; } 50% { height: 20px; } }
                @keyframes eq-3 { 0%, 100% { height: 3px; } 50% { height: 14px; } }
                @keyframes eq-4 { 0%, 100% { height: 3px; } 50% { height: 8px; } }
                
                .eq-bar { width: 3px; background: black; border-radius: 2px; transition: height 0.2s; }
                
                .hover-scale { transition: transform 0.2s; }
                .hover-scale:hover { transform: scale(1.1); }
                .hover-btn { transition: all 0.2s; }
                .hover-btn:hover { background: #333 !important; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2) !important; }
            `}</style>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="hover-scale"
                style={{
                    position: 'absolute',
                    top: '30px',
                    right: '30px',
                    width: '50px',
                    height: '50px',
                    background: 'black',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1010,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
            >
                <X size={24} />
            </button>

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '20px',
                gap: '80px',
                position: 'relative'
            }}>

                {/* Left: Card Area */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'slideUp 0.4s ease-out'
                }}>
                    <button onClick={goToPrev} className="hover-scale" style={{
                        position: 'absolute', left: '-80px',
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', color: 'black', opacity: 0.6,
                        padding: '10px'
                    }}>
                        <ChevronLeft size={48} />
                    </button>

                    <div style={{ perspective: '1200px', position: 'relative' }}>
                        <div style={{
                            padding: '15px',
                            background: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 25px 60px -10px rgba(0,0,0,0.2)',
                            transform: 'translateZ(0)',
                            transition: 'transform 0.3s ease'
                        }}>
                            <img
                                // React uses key to avoid re-mounting unless id changes if we want, 
                                // but removing key lets it diff the internal props for smoother transition
                                // if we don't want a full unmount/remount
                                src={card.image}
                                alt={card.name}
                                style={{
                                    height: '60vh',
                                    maxHeight: '600px',
                                    width: 'auto',
                                    display: 'block',
                                    borderRadius: '4px',
                                    transition: 'opacity 0.2s',
                                }}
                            />
                        </div>

                        {/* Reflection */}
                        <div style={{
                            position: 'absolute',
                            top: '100%', left: 0, right: 0,
                            height: '60px', marginTop: '10px',
                            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)',
                            transform: 'scaleX(0.8)', filter: 'blur(8px)', zIndex: -1
                        }} />
                    </div>

                    <button onClick={goToNext} className="hover-scale" style={{
                        position: 'absolute', right: '-80px',
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', color: 'black', opacity: 0.6,
                        padding: '10px'
                    }}>
                        <ChevronRight size={48} />
                    </button>
                </div>

                {/* Right: Info Box */}
                <div
                    key={card.id}
                    style={{
                        background: 'white',
                        padding: '40px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                        maxWidth: '400px',
                        width: '100%',
                        position: 'relative',
                        animation: 'slideUp 0.5s ease-out'
                    }}
                >
                    {/* EQ Visualizer - Always visible */}
                    <div style={{ position: 'absolute', top: '30px', right: '30px', display: 'flex', gap: '3px', alignItems: 'flex-end', height: '20px' }}>
                        {[...Array(4)].map((_, i) => {
                            // Assign a specific animation to each bar
                            const animName = `eq-${(i % 4) + 1}`;
                            const duration = 0.5 + Math.random() * 0.4; // randomish duration 0.5-0.9s
                            return (
                                <div key={i} className="eq-bar" style={{
                                    animation: isPlaying ? `${animName} ${duration}s infinite ease-in-out` : 'none',
                                    // Stagger starts slightly so they aren't perfectly synced if durations match
                                    animationDelay: `-${Math.random()}s`,
                                    height: isPlaying ? undefined : '3px' // Static when paused
                                }}></div>
                            );
                        })}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#999', display: 'block', marginBottom: '8px', letterSpacing: '2px' }}>
                            KARTE {String(card.id).padStart(2, '0')}
                        </span>
                        {/* No Serif */}
                        <h2 style={{ fontSize: '2.2rem', margin: 0, fontWeight: '800' }}>{card.name}</h2>
                    </div>

                    <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.05rem', minHeight: '100px' }}>
                        {card.description}
                    </p>

                    <div style={{ marginTop: '30px' }}>
                        <button
                            onClick={toggleAudio}
                            className="hover-btn"
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'black',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                borderRadius: '4px'
                            }}
                        >
                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                            {isPlaying ? 'Pause Audio' : 'Audio abspielen'}
                        </button>
                    </div>

                    <audio
                        ref={audioRef}
                        src={card.audio}
                        onEnded={() => setIsPlaying(false)}
                        onPause={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                    />
                </div>
            </div>

            {/* Responsive Mobile Styles */}
            <style>{`
                @media (max-width: 1024px) {
                    .showcase-content { flex-direction: column !important; padding: 60px 20px !important; gap: 40px !important; }
                    .showcase-card-img { height: 40vh !important; }
                }
             `}</style>
        </div>
    );
};

export default CardShowcase;
