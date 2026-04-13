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
    
    // Namen der Karten für die Analyse extrahieren
    const posFav1 = cards.find(c => c.id === selectionData.posFavs.first)?.name || "Licht";
    const posFav2 = cards.find(c => c.id === selectionData.posFavs.second)?.name || "Energie";
    const negFav1 = cards.find(c => c.id === selectionData.negFavs.first)?.name || "Schatten";

    // Der psychologische und künstlerische Auftrag an GPT-4o
    const systemPrompt = `Du bist ein Kunstexperte und Psychologe für das TU-Anima Projekt. 
    Deine Aufgabe ist es, eine Auswahl von Archetypen zu analysieren und ein visuelles Konzept für ein Seelenbild im spezifischen TU-Anima-Stil zu entwerfen.

    STIL-DEFINITION (TU-Anima nach Dr. Heinrich Reich):
    - Abstrakt, gegenstandslos, psycho-ästhetisch.
    - Inspiriert von archaischen Höhlenmalereien (Altamira), Runenformen und Zen-Kalligraphie.
    - Medium: Schwere Ölmalerei oder Mischtechnik auf grober, texturierter Leinwand.
    - Keine digitalen Glanzeffekte, keine fotorealistischen Objekte. 
    - Organische Fließstrukturen, Kratzspuren, erdige und tiefe Farbschichten.
    - Die Symbole sollen als "energetische Essenz" dargestellt werden, nicht als reale Objekte.

    ANALYSE-OBJEKTE:
    Ressourcen (Licht): ${posFav1} und ${posFav2}
    Blockade (Schatten): ${negFav1}

    ANTWORTE STRENG IM JSON-FORMAT:
    {
      "interpretation": "Deine ca. 300 Wörter tiefe, psychologische Analyse auf Deutsch...",
      "visual_description": "A sophisticated English description of an abstract expressionist oil painting on raw canvas. Focus on archaic, primitive symbolic shapes and organic energy flows. Integrate the essences of ${posFav1} and ${posFav2} as luminous centers of energy, contrasting with the dark, jagged or heavy texture of ${negFav1}. Use earthy tones, deep crimsons, and raw umber mixed with vibrant light. No literal objects, pure symbolic abstraction, heavy impasto texture."
    }`;

    try {
        // SCHRITT 1: GPT-4o entwirft die Analyse und die visuelle Beschreibung
        console.log("🧠 Schritt 1: GPT-4o analysiert Archetypen und entwirft visuelles Konzept...");
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
                // Technisches Modell-Flag (nomenklatorisch 'gpt-image-1' genannt)
                model: "dall-e-3", 
                // Die visuelle Beschreibung von GPT-4o als Eingabe
                prompt: resultJson.visual_description,
                n: 1,
                size: "1024x1792",
                quality: "hd",
                style: "natural", // 'natural' sorgt für einen künstlerischen, weniger 'ki-artigen' Look
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