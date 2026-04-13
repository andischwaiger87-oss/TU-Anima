import { cards } from '../data/cards';

const API_KEY_STORAGE = 'tuanima_openai_key';
const ENV_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const getApiKey = () => localStorage.getItem(API_KEY_STORAGE) || ENV_API_KEY;
export const setApiKey = (key) => localStorage.setItem(API_KEY_STORAGE, key);

export const generateSoulCard = async (selectionData) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key missing");

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
    let conflicts = [];
    posCards.forEach(card => {
        card.g_values.forEach(gId => {
            if (selectionData.posCards.includes(gId)) {
                const conflictCard = cards.find(c => c.id === gId);
                if (conflictCard) {
                    const pair = [card.name, conflictCard.name].sort().join(" vs. ");
                    conflicts.push(pair);
                }
            }
        });
    });
    const uniqueConflicts = [...new Set(conflicts)];
    const conflictString = uniqueConflicts.length > 0 
        ? `ACHTUNG - INNERE AMBIVALENZ: Der Testand hat folgende Gegenpole GLEICHZEITIG positiv gewählt, was auf einen starken inneren Spannungszustand hindeutet: ${uniqueConflicts.join(', ')}.` 
        : "Keine offenkundigen Gegenpol-Spannungen in der Positiv-Auswahl.";

    // 4. DER NEUE, STRUKTURIERTE SYSTEM-PROMPT
    const systemPrompt = `Du bist ein hochqualifizierter Tiefenpsychologe nach der Lehre von Dr. Heinrich Reich (TU-Anima Bildertest). 
    Deine Aufgabe ist eine hochgradig individuelle, differenzierte und strukturierte Falldiagnose des Testanden sowie der Entwurf eines präzisen Bild-Prompts.

    VERBOTENE FLOSKELN (STRIKT VERMEIDEN!):
    - "In der psychologischen Analyse..."
    - "Psychologisch gesehen..."
    - "Zusammenfassend lässt sich sagen..."
    -> Verwende NIEMALS standardisierte KI-Einleitungen oder -Schlusssätze. Steig sofort klinisch und tiefgründig in die Diagnose ein.

    === PSYCHOLOGISCHE DATEN DES TESTANDEN ===
    
    FAVORITEN (Die stärksten unbewussten Triebfedern):
    - Positiver Kern 1: ${posFav1?.name} (Generell: ${posFav1?.meaning} | Spezifisch positiv gewählt: ${posFav1?.pos_meaning})
    - Positiver Kern 2: ${posFav2?.name} (Generell: ${posFav2?.meaning} | Spezifisch positiv gewählt: ${posFav2?.pos_meaning})
    - Haupt-Blockade/Abwehr: ${negFav1?.name} (Generell: ${negFav1?.meaning} | Spezifisch negativ gewählt: ${negFav1?.neg_meaning})

    ALLE POSITIVEN WIRKRÄFTE (Ressourcen & Sehnsüchte):
    ${posDetails}

    ALLE NEGATIVEN WIRKRÄFTE (Verdrängung & Abwehr):
    ${negDetails}

    STRUKTURELLE DYNAMIK:
    ${conflictString}

    === DEIN AUFTRAG ===
    
    1. INTERPRETATION (ca. 400 Wörter): Verfasse eine hochgradig individuelle Diagnose anhand der Daten.
    Strukturiere deinen Text ZWINGEND als HTML-Code! Verwende <h3> für die 4 Überschriften und <p> für die Absätze. Nutze KEIN Markdown.
    <h3>Zentrale Seelendynamik</h3>
    <p>(Analyse der positiven Favoriten)</p>
    <h3>Abwehr und Blockaden</h3>
    <p>(Tiefenanalyse des negativen Favoriten)</p>
    <h3>Innere Spannungsfelder</h3>
    <p>(Analyse der Ambivalenzen / Reibung)</p>
    <h3>Diagnostischer Ausblick</h3>
    <p>(Ein prägnanter, therapeutischer Blick auf die Entwicklungsaufgabe)</p>
    
    2. VISUAL DESCRIPTION FÜR DEN BILDGENERATOR:
    Übersetze die psychologische Dynamik in ein abstraktes Bild. Halte dich EXAKT an diese Vorgaben, um ein analoges Artefakt zu simulieren:
    - MATERIAL: Ein Foto einer physischen, alten Karte aus Karton. Sichtbares Papierkorn, leichte Abnutzung.
    - STIL & LINIEN: Rauer, handwerklicher Linolschnitt oder matte Gouache. Linien sind freihändig, unvollkommen, zittrig, mit Druckunregelmäßigkeiten.
    - FARBEN: Gesättigt, aber erdig und MATT (getrocknete Farbe auf Karton). Variationen in der Farbdichte (unperfekte Füllung). Keine digitalen Leuchtfarben.
    - KOMPOSITION: Organisch, symbolisch, Naive Kunst/Art Brut. KEINE Vektorgrafik, KEIN Hochglanz, KEINE perfekten Geometrien.

    ANTWORTE STRENG IM JSON-FORMAT:
    {
      "interpretation": "Deine fundierte HTML-Analyse...",
      "visual_description": "A close-up photograph of a vintage, physical psychological test card printed on rough, worn cardboard. The art style is a raw, artisanal linocut print or thick, matte hand-painted gouache. It features imperfect, slightly jittery, freehand black contour lines with visible printing irregularities and ink bleed. The colors are saturated but earthy and matte (like dried paint), with uneven color density and imperfect fills inside the lines. Absolutely NO glossy, digital, vector-like, or neon elements. The composition is an organic, naive abstraction symbolizing ${posFav1?.name} and ${posFav2?.name}, clashing with ${negFav1?.name}. The image must look like a genuine, raw, handmade analog artifact from the mid-20th century, completely avoiding any precise geometric or clean digital aesthetic."
    }`;

    try {
        console.log("🧠 Schritt 1: GPT-4o analysiert Archetypen und entwirft visuelles Konzept im rauen Artefakt-Stil...");
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

        console.timeEnd("⏱️ Dauer Bild-API");
        console.timeEnd("⏱️ Gesamtdauer der KI-Generierung");
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