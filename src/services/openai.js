import { cards } from '../data/cards';

const API_KEY_STORAGE = 'tuanima_openai_key';

// Zugriff auf Cloudflare/Vite Environment Variable
const ENV_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const getApiKey = () => {
    const localKey = localStorage.getItem(API_KEY_STORAGE);
    return localKey || ENV_API_KEY;
};

export const setApiKey = (key) => localStorage.setItem(API_KEY_STORAGE, key);

export const generateSoulCard = async (selectionData) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key missing");

    // --- START LOGGING ---
    console.group("🚀 TU-Anima: OpenAI API Prozess");
    console.time("⏱️ Gesamtdauer der KI-Generierung");
    console.log("🔍 Starte Analyse für Auswahl:", selectionData);
    // ---------------------

    // 1. Prepare Prompt
    const posNames = selectionData.posCards.map(id => cards.find(c => c.id === id).name).join(', ');
    const negNames = selectionData.negCards.map(id => cards.find(c => c.id === id).name).join(', ');

    const posFav1 = cards.find(c => c.id === selectionData.posFavs.first)?.name;
    const posFav2 = cards.find(c => c.id === selectionData.posFavs.second)?.name;

    const negFav1 = cards.find(c => c.id === selectionData.negFavs.first)?.name;
    const negFav2 = cards.find(c => c.id === selectionData.negFavs.second)?.name;

    const systemPrompt = `Du bist ein psychologischer Analyst für das TU-Anima Projekt.
  Analysiere die Kartenauswahl.
  Ausgewählte Positive Karten: ${posNames}
  Ausgewählte Negative Karten: ${negNames}
  
  WICHTIGSTE KARTEN (Favoriten):
  Positiv 1: ${posFav1}
  Positiv 2: ${posFav2}
  Negativ 1: ${negFav1}
  Negativ 2: ${negFav2}
  
  Erstelle eine tiefgründige, psychologische Interpretation (ca. 300 Wörter) auf Basis dieser Symbolik.
  Fokussiere dich auf Ressourcen (Positiv) und Blockaden/Konflikte (Negativ).`;

    // --- LOG TEXT API ---
    console.log("📝 Schritt 1: Sende Text-Anfrage an GPT-4o...");
    console.time("⏱️ Dauer Text-API");
    // --------------------

    try {
        // 2. Call Text API (GPT-4o)
        const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [{ role: "system", content: systemPrompt }],
                temperature: 0.7
            })
        });

        if (!textResponse.ok) {
            const errorText = await textResponse.text();
            console.error("❌ Fehler bei der Text-Generierung!", errorText);
            throw new Error(`Text API Error: ${textResponse.status}`);
        }
        
        const textData = await textResponse.json();
        
        // --- LOG TEXT RESULT ---
        console.timeEnd("⏱️ Dauer Text-API");
        console.log("✅ Text erfolgreich generiert!");
        console.log("🧠 Verwendetes Text-Modell (von API bestätigt):", textData.model);
        console.log("📊 Verbrauchte Tokens:", textData.usage);
        // -----------------------

        const interpretation = textData.choices[0].message.content;

        // 3. Call Image API (DALL-E 3)
        const imagePrompt = `Abstract surrealistic soul card art. Psychological symbolism: ${posFav1} and ${posFav2} (light/positive aspects) contrasting with ${negFav1} (shadow aspects). Artistic style: Modern abstract expressionism, vibrant colors, premium texture.`;

        // --- LOG IMAGE API ---
        console.log("🎨 Schritt 2: Sende Bild-Anfrage an DALL-E 3...");
        console.log("🖼️ Verwendeter Bild-Prompt:", imagePrompt);
        console.time("⏱️ Dauer Bild-API");
        // ---------------------

        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: imagePrompt,
                n: 1,
                size: "1024x1792",
                quality: "hd",
                style: "vivid",
                response_format: "b64_json"
            })
        });

        if (!imageResponse.ok) {
            const errorImage = await imageResponse.text();
            console.error("❌ Fehler bei der Bild-Generierung!", errorImage);
            throw new Error(`Image API Error: ${imageResponse.status}`);
        }
        
        const imageData = await imageResponse.json();

        // --- LOG IMAGE RESULT ---
        console.timeEnd("⏱️ Dauer Bild-API");
        console.log("✅ Bild erfolgreich generiert! (Modell: DALL-E 3)");
        console.timeEnd("⏱️ Gesamtdauer der KI-Generierung");
        console.groupEnd();
        // ------------------------

        return {
            interpretation,
            imageUrl: `data:image/png;base64,${imageData.data[0].b64_json}`
        };

    } catch (error) {
        console.error("🚨 Kritischer Fehler im generateSoulCard Prozess:", error);
        console.groupEnd();
        throw error;
    }
};