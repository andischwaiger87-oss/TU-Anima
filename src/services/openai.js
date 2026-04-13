import { cards } from '../data/cards';

const API_KEY_STORAGE = 'tuanima_openai_key';
const ENV_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const getApiKey = () => localStorage.getItem(API_KEY_STORAGE) || ENV_API_KEY;
export const setApiKey = (key) => localStorage.setItem(API_KEY_STORAGE, key);

export const generateSoulCard = async (selectionData) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key missing");

    // --- START LOGGING ---
    console.group("🚀 TU-Anima: Authentischer Seelenbild-Prozess");
    console.time("⏱️ Gesamtdauer der KI-Generierung");
    
    // 1. VOLLSTÄNDIGE KARTEN-OBJEKTE EXTRAHIEREN
    const posCards = selectionData.posCards.map(id => cards.find(c => c.id === id)).filter(Boolean);
    const negCards = selectionData.negCards.map(id => cards.find(c => c.id === id)).filter(Boolean);

    const posFav1 = cards.find(c => c.id === selectionData.posFavs.first);
    const posFav2 = cards.find(c => c.id === selectionData.posFavs.second);
    const negFav1 = cards.find(c => c.id === selectionData.negFavs.first);

    // 2. TIEFENPSYCHOLOGISCHES LEXIKON AUFBAUEN
    const posDetails = posCards.map(c => `- ${c.name} (Typ ${c.type}): ${c.pos_meaning}`).join('\n');
    const negDetails = negCards.map(c => `- ${c.name} (Typ ${c.type}): ${c.neg_meaning}`).join('\n');

    // 3. KONFLIKT-SCANNER (G-Werte Analyse)
    // Wir prüfen, ob Gegenpole GEMEINSAM im Positiv-Bereich gewählt wurden (Ambivalenz)
    let conflicts = [];
    posCards.forEach(card => {
        card.g_values.forEach(gId => {
            if (selectionData.posCards.includes(gId)) {
                const conflictCard = cards.find(c => c.id === gId);
                if (conflictCard) {
                    // Verhindert doppelte Einträge wie A->B und B->A
                    const pair = [card.name, conflictCard.name].sort().join(" vs. ");
                    conflicts.push(pair);
                }
            }
        });
    });
    // Duplikate entfernen
    const uniqueConflicts = [...new Set(conflicts)];
    const conflictString = uniqueConflicts.length > 0 
        ? `ACHTUNG - INNERE AMBIVALENZ GEFUNDEN:\nDer Testand hat folgende Gegenpole GLEICHZEITIG positiv gewählt, was auf einen inneren Spannungszustand hindeutet: ${uniqueConflicts.join(', ')}.` 
        : "Keine offensichtlichen Gegenpol-Spannungen in der Positiv-Auswahl. Gesunde Abgrenzung.";

    // Der psychologische und künstlerische Auftrag an GPT-4o
    const systemPrompt = `Du bist ein hochqualifizierter Psychoanalytiker für den TU-Anima Bildertest (nach Dr. Heinrich Reich) und Kunstexperte. 
    Deine Aufgabe ist es, eine tiefenpsychologische Analyse auf Basis der exakten Test-Parameter zu verfassen und ein visuelles Konzept für ein Seelenbild zu entwerfen.

    === PSYCHOLOGISCHE DATEN DES TESTANDEN ===
    
    FAVORITEN (Die stärksten Seelenkräfte):
    - Positiver Kern 1: ${posFav1?.name} (${posFav1?.meaning})
    - Positiver Kern 2: ${posFav2?.name} (${posFav2?.meaning})
    - Haupt-Blockade: ${negFav1?.name} (${negFav1?.meaning})

    ALLE POSITIVEN WIRKRÄFTE (Ressourcen & Sehnsüchte):
    ${posDetails}

    ALLE NEGATIVEN WIRKRÄFTE (Verdrängung & Abwehr):
    ${negDetails}

    STRUKTURELLE DYNAMIK:
    ${conflictString}

    === DEIN AUFTRAG ===
    
    1. INTERPRETATION (ca. 300 Wörter): Verfasse eine tiefgreifende, empathische Analyse. Nutze ZWINGEND die oben bereitgestellten spezifischen Bedeutungen nach Dr. Reich, anstatt allgemein zu interpretieren. Gehe besonders auf die Favoriten und eventuelle Ambivalenzen ein.
    
    2. VISUAL DESCRIPTION: 
    - Abstrakt, gegenstandslos, psycho-ästhetisch.
    - Inspiriert von archaischen Höhlenmalereien (Altamira), Runenformen und Zen-Kalligraphie.
    - Medium: Schwere Ölmalerei oder Mischtechnik auf grober, texturierter Leinwand.
    - Keine digitalen Glanzeffekte, keine fotorealistischen Objekte. 
    - Organische Fließstrukturen, Kratzspuren, erdige und tiefe Farbschichten.

    ANTWORTE STRENG IM JSON-FORMAT:
    {
      "interpretation": "Deine fundierte, psychologische Analyse auf Deutsch...",
      "visual_description": "A sophisticated English description of an abstract expressionist oil painting on raw canvas. Focus on archaic, primitive symbolic shapes and organic energy flows. Integrate the essences of ${posFav1?.name} and ${posFav2?.name} as luminous centers of energy, contrasting with the dark, jagged or heavy texture of ${negFav1?.name}. Use earthy tones, deep crimsons, and raw umber mixed with vibrant light. No literal objects, pure symbolic abstraction, heavy impasto texture."
    }`;

    try {
        // SCHRITT 1: GPT-4o entwirft die Analyse und die visuelle Beschreibung
        console.log("🧠 Schritt 1: GPT-4o analysiert Archetypen (inkl. V/G-Werte) und entwirft visuelles Konzept...");
        console.time("⏱️ Dauer GPT-4o");
        
        const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [{ role: "system", content: systemPrompt }],
                response_format: { type: "json_object" },
                temperature: 0.7
            })
        });

        if (!textResponse.ok) throw new Error(`Text API Error: ${textResponse.status}`);
        const textData = await textResponse.json();
        const resultJson = JSON.parse(textData.choices[0].message.content);
        
        console.timeEnd("⏱️ Dauer GPT-4o");
        console.log("📝 GPT-4o Visuelles Konzept:", resultJson.visual_description);
        console.log("📊 Konflikt-Analyse ergab:", conflictString);

        // SCHRITT 2: OpenAI Image Generation API
        console.log("🎨 Schritt 2: OpenAI Image Generation API erstellt das Seelenbild (Base64)...");
        console.time("⏱️ Dauer Bild-API");

        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "dall-e-3", 
                prompt: resultJson.visual_description,
                n: 1,
                size: "1024x1792",
                quality: "hd",
                style: "natural",
                response_format: "b64_json"
            })
        });

        if (!imageResponse.ok) throw new Error(`Image API Error: ${imageResponse.status}`);
        const imageData = await imageResponse.json();

        // --- FINAL LOGS ---
        console.timeEnd("⏱️ Dauer Bild-API");
        console.timeEnd("⏱️ Gesamtdauer der KI-Generierung");
        console.log("✅ Prozess erfolgreich abgeschlossen.");
        console.groupEnd();

        return {
            interpretation: resultJson.interpretation,
            imageUrl: `data:image/png;base64,${imageData.data[0].b64_json}`
        };

    } catch (error) {
        console.error("🚨 Fehler im TU-Anima Generierungsprozess:", error);
        console.groupEnd();
        throw error;
    }
};