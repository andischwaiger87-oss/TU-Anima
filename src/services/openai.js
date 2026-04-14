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
    - MATERIAL: Spielkartenkarton mit sichtbarem, altweißem Rand um das Motiv.
    - STIL & LINIEN: Abstrakter Expressionismus / Art Brut. Geometrische oder organische Formen. ZWINGEND dicke, unperfekte, schwarze Konturlinien.
    - FARBEN: Matte, erdige Primärfarben (Dunkelgelb, Karminrot, Dunkelblau, Waldgrün). Kräftig, um emotionale Reaktionen wie beim Lüscher-Test hervorzurufen.
    - KOMPOSITION: Chaotisch, abstrakt, archetypisch. Keine Menschen, keine echten Objekte, ABSOLUT KEIN TEXT. KOMPLETT FLACH (2D).

    ANTWORTE STRENG IM JSON-FORMAT WIE FOLGT (ohne Zeilenumbrüche im String!):
    {
      "interpretation": "Deine HTML-Analyse...",
      "visual_description": "A flat, top-down photograph of a single, physical psychological symbol card. The artwork is framed by a visible, off-white, aged cardboard margin. The art style is primitive abstract expressionism. Abstract Shapes: pure geometric or organic shapes and energetic patterns. No real objects, no people, ABSOLUTELY NO TEXT. The depictions feel archetypal, similar to the Lüscher color test but more complex. Crucially, the image features very thick, erratic, and unrefined hand-painted BLACK contour lines. Color Palette: bold, matte, earthy primary colors (deep yellow, crimson red, dark blue, forest green) designed to evoke immediate emotional reactions. The color fill is unmixed and imperfect. The composition symbolizes the interplay between ${posFav1?.name}, ${posFav2?.name}, and their conflict with ${negFav1?.name}. Strictly flat 2D artwork, no gradients, no 3D elements, no digital gloss. It must look exactly like an authentic, messy, hand-painted analog card."
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