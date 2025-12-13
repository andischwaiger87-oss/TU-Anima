import React, { useState } from 'react';
import { Plus, Minus, HelpCircle, X } from 'lucide-react';

const faqData = [
    {
        question: "Was ist der TU-Anima Test?",
        answer: "Der Tu-Anima-Bildertest (auch TUA-Test genannt) ist ein sprachfreier Symboltest, der in der tiefenpsychologischen Diagnostik eingesetzt wird. Entwickelt von Dr. Heinrich Reich, besteht er aus 36 Bildkarten mit abstrakten Farb- und Formsymbolen. Die Testperson wählt dabei 6 Karten aus, die sie als sympathisch empfindet, und 6 Karten, die sie als unsympathisch erlebt. Jede Karte ist mit bestimmten Deutungen verbunden, die auf jahrzehntelanger Erfahrung mit Testpersonen basieren. Durch die Auswahl der Bilder wird ein innerer Dialog zwischen Symbol und Seele angeregt, der Zugang zu tiefen Schichten des Unbewussten ermöglicht."
    },
    {
        question: "Wie wird der Test durchgeführt?",
        answer: "Der Tu-Anima-Bildertest besteht aus 36 abstrakten Symbolkarten. Im Verlauf des Tests wählen Sie 6 Karten aus, die Sie als sympathisch empfinden, und 6 Karten, die Sie als unsympathisch empfinden; die übrigen 24 Karten bleiben unberücksichtigt. Die sympathisch gewählten Karten werden dabei mit einem grünen Haken markiert, die unsympathisch empfundenen Karten mit einem roten Kreuz. Anschließend bestimmen Sie jeweils eine Karte mit der stärksten (1. Favorit) und eine mit der zweitstärksten (2. Favorit) emotionalen Resonanz."
    },
    {
        question: "Wie benutze ich die App?",
        answer: (
            <>
                <p><strong>1. Überblick & Navigation:</strong> Sie beginnen mit der Übersicht aller 36 Karten.</p>
                <p><strong>2. Karten auswählen & markieren:</strong> Bewegen Sie den Mauszeiger über eine Karte. Wählen Sie jeweils 6 positive und 6 negative Karten. Bestimmen Sie zudem Ihre Favoriten per Stern-Symbol.</p>
                <p><strong>3. Karten vergrößern & Bedeutung:</strong> Klicken Sie auf eine Karte für die Einzelansicht. Dort finden Sie (optional) die Deutung und eine Vorlesefunktion.</p>
                <p><em>Hinweis: Rufen Sie die Bedeutungen am besten erst nach Abschluss Ihrer Auswahl auf.</em></p>
            </>
        )
    },
    {
        question: "Auf welchen Geräten ist die App nutzbar?",
        answer: "Der Test ist Full-Responsive und läuft auf allen gängigen Geräten (Smartphone, Tablet, Desktop)."
    }
];

const FAQ = ({ onClose }) => {
    const [openIndex, setOpenIndex] = useState(0);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto'
        }}>
            {/* Header */}
            <div style={{
                padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                maxWidth: '1000px', margin: '0 auto', width: '100%'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Grid3x3Icon />
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>FAQ & Hilfe</h2>
                </div>
                <button onClick={onClose} style={{
                    background: 'black', border: 'none', borderRadius: '50%', width: '50px', height: '50px',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'transform 0.2s'
                }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <X size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="faq-content-wrapper" style={{ padding: '0 40px 80px 40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
                    {faqData.map((item, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <button
                                    onClick={() => toggle(index)}
                                    style={{
                                        width: '100%', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        background: isOpen ? '#fafafa' : 'white', border: 'none', cursor: 'pointer', textAlign: 'left',
                                        fontSize: '1.25rem', fontWeight: '600', transition: 'background 0.2s', color: 'black'
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <span style={{
                                            background: 'black', color: 'white', borderRadius: '50%', width: '32px', height: '32px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                                        </span>
                                        <span style={{ fontSize: '1rem' }}>{item.question}</span>
                                    </span>
                                </button>
                                {isOpen && (
                                    <div style={{ padding: '0 20px 30px 68px', lineHeight: '1.6', color: '#444', fontSize: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
                                        {item.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 768px) {
                    .faq-content-wrapper { padding: 0 15px 40px 15px !important; }
                }
             `}</style>
        </div>
    );
};

// Mock Icon for header
const Grid3x3Icon = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 4px)', gap: '4px' }}>
        {[...Array(9)].map((_, i) => <div key={i} style={{ width: '4px', height: '4px', background: 'black', borderRadius: '1px' }} />)}
    </div>
);

export default FAQ;
