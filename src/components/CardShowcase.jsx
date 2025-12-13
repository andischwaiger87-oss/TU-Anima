import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, HelpCircle } from 'lucide-react';
import { cards } from '../data/cards';

const CardShowcase = ({ card: initialCard, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        // Find index of initial card
        const idx = cards.findIndex(c => c.id === initialCard.id);
        if (idx !== -1) setCurrentIndex(idx);

        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [initialCard]);

    useEffect(() => {
        // Scroll to top of content when card changes on mobile
        if (contentRef.current) contentRef.current.scrollTop = 0;
    }, [currentIndex]);

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

                /* Audio Button Container Default (Desktop) */
                .audio-btn-container {
                    margin-top: 30px;
                }
                .audio-btn {
                    width: 100%;
                    padding: 16px;
                    background: black;
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    border-radius: 4px;
                }

                /* Mobile Controls (Hidden on Desktop) */
                .mobile-controls {
                    display: none;
                }
                
                /* Desktop Controls (Hidden on Mobile) */
                .desktop-only-btn {
                    display: flex;
                }


                /* Responsive Styles */
                @media (max-width: 1024px) {
                    .showcase-container {
                        flex-direction: column !important;
                        padding: 10px !important;
                        gap: 10px !important;
                        overflow-y: auto;
                        justify-content: flex-start !important;
                        padding-bottom: 120px !important; /* Space for fixed button */
                    }
                    .showcase-card-area {
                        margin-top: 50px; /* Space for close btn */
                        width: 100%;
                        height: auto;
                        margin-bottom: 20px;
                        /* No relative positioning here for arrows anymore, they are global */
                    }
                    .showcase-card-img {
                        height: auto !important;
                        max-height: 50vh !important; /* Made larger as requested */
                        width: auto !important;
                        max-width: 90% !important; /* Made wider */
                        margin: 0 auto;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
                    }
                    
                    /* Hide Desktop Nav Buttons */
                    .showcase-nav-btn {
                        display: none !important;
                    }
                    
                    /* Show Mobile Nav Controls */
                    .mobile-controls {
                        display: block;
                    }

                    .mobile-nav-btn {
                        position: fixed;
                        top: 40%; /* Fixed vertical position */
                        z-index: 1050; /* Above everything */
                        background: rgba(255,255,255,0.9);
                        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                        width: 48px;
                        height: 48px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        border: none;
                        color: black;
                    }
                    .mobile-prev { left: 10px; }
                    .mobile-next { right: 10px; }


                    .showcase-info-box {
                        max-width: 100% !important;
                        padding: 20px !important;
                        box-shadow: none !important;
                        background: transparent !important;
                        text-align: left !important; /* Left aligned as requested */
                    }
                    .showcase-info-box h2 {
                        font-size: 1.8rem !important;
                    }
                    .showcase-eq-container {
                        /* Right aligned on mobile as per design, or absolute top right of info box */
                        position: absolute !important; 
                        top: 20px !important; right: 20px !important;
                    }
                    
                    /* Hide sticky button inside content */
                    .audio-btn-container .audio-btn {
                        display: none; 
                    }

                    /* Sticky Audio Button Global */
                    .mobile-audio-btn-container {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        padding: 20px;
                        background: rgba(255,255,255,0.95);
                        backdrop-filter: blur(10px);
                        border-top: 1px solid #eee;
                        z-index: 2000;
                        box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
                        display: block !important;
                    }
                    .mobile-audio-btn {
                        width: 100%;
                        padding: 16px;
                        background: black;
                        color: white;
                        border: none;
                        border-radius: 50px;
                        font-size: 1.1rem;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    }
                }
            `}</style>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="hover-scale"
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '44px',
                    height: '44px',
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

            {/* Mobile Fixed Controls */}
            <div className="mobile-controls">
                <button onClick={goToPrev} className="mobile-nav-btn mobile-prev">
                    <ChevronLeft size={28} />
                </button>
                <button onClick={goToNext} className="mobile-nav-btn mobile-next">
                    <ChevronRight size={28} />
                </button>

                {/* Mobile Sticky Audio Button */}
                <div className="mobile-audio-btn-container" style={{ display: 'none' }}>
                    <button onClick={toggleAudio} className="mobile-audio-btn">
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        {isPlaying ? 'Pause Audio' : 'Audio abspielen'}
                    </button>
                </div>
            </div>

            {/* Main Content Container */}
            <div
                ref={contentRef}
                className="showcase-container"
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '20px',
                    gap: '80px',
                    position: 'relative',
                    height: '100%',
                }}
            >

                {/* Left: Card Area (Animates SlideUp) */}
                <div className="showcase-card-area" key={`card-img-${currentIndex}`} style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'slideUp 0.4s ease-out'
                }}>
                    {/* Desktop Nav Buttons */}
                    <button onClick={goToPrev} className="hover-scale showcase-nav-btn" style={{
                        position: 'absolute', left: '-80px',
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', color: 'black', opacity: 0.6,
                        padding: '10px', zIndex: 20
                    }}>
                        <ChevronLeft size={48} />
                    </button>

                    <div style={{ perspective: '1200px', position: 'relative' }}>
                        <div style={{
                            padding: '10px',
                            background: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 25px 60px -10px rgba(0,0,0,0.2)',
                            transform: 'translateZ(0)',
                            transition: 'transform 0.3s ease'
                        }}>
                            <img
                                className="showcase-card-img"
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
                    </div>

                    <button onClick={goToNext} className="hover-scale showcase-nav-btn" style={{
                        position: 'absolute', right: '-80px',
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', color: 'black', opacity: 0.6,
                        padding: '10px', zIndex: 20
                    }}>
                        <ChevronRight size={48} />
                    </button>
                </div>

                {/* Right: Info Box (Animates SlideUp) */}
                <div
                    key={`card-info-${currentIndex}`}
                    className="showcase-info-box"
                    style={{
                        background: 'white',
                        padding: '40px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                        maxWidth: '400px',
                        width: '100%',
                        position: 'relative',
                        animation: 'slideUp 0.5s ease-out',
                        borderRadius: '12px'
                    }}
                >
                    {/* EQ Visualizer */}
                    <div className="showcase-eq-container" style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '3px', alignItems: 'flex-end', height: '20px' }}>
                        {[...Array(4)].map((_, i) => {
                            const animName = `eq-${(i % 4) + 1}`;
                            const duration = 0.5 + Math.random() * 0.4;
                            return (
                                <div key={i} className="eq-bar" style={{
                                    animation: isPlaying ? `${animName} ${duration}s infinite ease-in-out` : 'none',
                                    animationDelay: `-${Math.random()}s`,
                                    height: isPlaying ? undefined : '3px'
                                }}></div>
                            );
                        })}
                    </div>

                    <div style={{ marginBottom: '20px', paddingRight: '40px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#999', display: 'block', marginBottom: '8px', letterSpacing: '2px' }}>
                            KARTE {String(card.id).padStart(2, '0')}
                        </span>
                        <h2 style={{ fontSize: '2.2rem', margin: 0, fontWeight: '800' }}>{card.name}</h2>
                    </div>

                    <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.05rem', minHeight: '80px' }}>
                        {card.description}
                    </p>

                    <div className="audio-btn-container controls-desktop">
                        <button
                            onClick={toggleAudio}
                            className="hover-btn audio-btn"
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
        </div>
    );
};

export default CardShowcase;
