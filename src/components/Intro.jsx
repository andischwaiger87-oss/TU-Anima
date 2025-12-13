import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Star, XCircle } from 'lucide-react';
import '../index.css';

const steps = [
    {
        id: 'welcome',
        title: 'TU-Anima Bildertest',
        subtitle: 'Eine Reise zu deiner Seelenkarte',
        content: (
            <p style={{ maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
                Dieser Test analysiert deine unbewusste Wahl von Symbolbildern.
                Es gibt keine falschen Antworten – vertraue deinem ersten Impuls.
            </p>
        )
    },
    {
        id: 'step1',
        title: '1. Positive Wahl',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <CheckCircle size={64} className="icon-pulse" color="var(--color-success)" />
                <p style={{ maxWidth: '400px', lineHeight: '1.6' }}>
                    Wähle aus der Übersicht genau <strong>6 Karten</strong> aus, die dich spontan <strong>ansprechen</strong> oder positive Gefühle auslösen.
                </p>
            </div>
        )
    },
    {
        id: 'step2',
        title: '2. Deine Favoriten',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Star size={48} fill="var(--color-gold)" color="var(--color-gold)" />
                    <Star size={32} fill="var(--color-gold)" color="var(--color-gold)" style={{ marginTop: '16px' }} />
                </div>
                <p style={{ maxWidth: '400px', lineHeight: '1.6' }}>
                    Bestimme aus deinen gewählten Karten deinen <strong>1.</strong> und <strong>2. Favoriten</strong>.
                    Diese haben später eine besondere Gewichtung.
                </p>
            </div>
        )
    },
    {
        id: 'step3',
        title: '3. Negative Wahl',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <XCircle size={64} className="icon-pulse" color="var(--color-error)" />
                <p style={{ maxWidth: '400px', lineHeight: '1.6' }}>
                    Wähle anschließend <strong>6 Karten</strong> aus, die dich <strong>abstoßen</strong> oder negative Gefühle auslösen.
                    Auch hier wählst du wieder zwei Favoriten.
                </p>
            </div>
        )
    }
];

const Intro = ({ onStart }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(curr => curr + 1);
        } else {
            onStart();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(curr => curr - 1);
        }
    };

    const step = steps[currentStep];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-out'
        }}>
            <div style={{
                maxWidth: '600px',
                width: '100%',
                background: 'white',
                padding: '40px',
                borderRadius: '32px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>

                {/* Header */}
                <div>
                    <div style={{ fontSize: '0.9rem', color: '#999', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Schritt {currentStep + 1} von {steps.length}
                    </div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', lineHeight: '1.2' }}>{step.title}</h1>
                    {step.subtitle && <h2 style={{ fontSize: '1.2rem', fontWeight: 'normal', color: '#666' }}>{step.subtitle}</h2>}
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
                    {step.content}
                </div>

                {/* Footer / Nav */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Dots */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: idx === currentStep ? 'black' : '#ddd',
                                    transition: 'all 0.3s'
                                }}
                            />
                        ))}
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {currentStep > 0 && (
                            <button
                                onClick={prevStep}
                                style={{
                                    width: '50px', height: '50px', borderRadius: '50%',
                                    border: '1px solid #eee', background: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        <button
                            onClick={nextStep}
                            style={{
                                padding: '0 30px', height: '50px', borderRadius: '25px',
                                border: 'none', background: 'black', color: 'white',
                                fontSize: '1rem', fontWeight: '500',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                cursor: 'pointer',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                            }}
                        >
                            {currentStep === steps.length - 1 ? 'Starten' : 'Weiter'}
                            {currentStep !== steps.length - 1 && <ChevronRight size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .icon-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
        </div>
    );
};

export default Intro;
