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
        ? `ACHTUNG - INNERE AMBIVALENZ: Du hast folgende Gegenpole GLEICHZEITIG positiv gewählt, was auf einen starken inneren Spannungszustand hindeutet: ${uniqueConflicts.join(', ')}.` 
        : "Keine offenkundigen Gegenpol-Spannungen in Deiner Positiv-Auswahl.";

// 4. DER NEUE, STRUKTURIERTE SYSTEM-PROMPT
    const systemPrompt = `Du bist ein hochqualifizierter Tiefenpsychologe nach der Lehre von Dr. Heinrich Reich (TU-Anima Bildertest). 
    Deine Aufgabe ist eine hochgradig individuelle, differenzierte und strukturierte psychologische Diagnose sowie der Entwurf eines präzisen Bild-Prompts.

    SPRACHSTIL & ANSPRACHE (EXTREM WICHTIG):
    - Sprich die Person ZWINGEND direkt, empathisch und persönlich mit "Du" an (z.B. "Du zeigst...", "Deine Wahl offenbart...").
    - Verwende NIEMALS unpersönliche Begriffe wie "Der Testand", "Die Person", "Der Patient" oder "Er/Sie".

    VERBOTENE FLOSKELN (STRIKT VERMEIDEN!):
    - "In der psychologischen Analyse..."
    - "Psychologisch gesehen..."
    - "Zusammenfassend lässt sich sagen..."
    -> Verwende NIEMALS standardisierte KI-Einleitungen oder -Schlusssätze. Steig sofort klinisch, tiefgründig und in der direkten "Du"-Ansprache in die Diagnose ein.

    === PSYCHOLOGISCHE DATEN (DEINE GRUNDLAGE) ===
    
    FAVORITEN (Deine stärksten unbewussten Triebfedern):
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
    <p>(Analyse der positiven Favoriten - in direkter Du-Ansprache)</p>
    <h3>Abwehr und Blockaden</h3>
    <p>(Tiefenanalyse des negativen Favoriten - in direkter Du-Ansprache)</p>
    <h3>Innere Spannungsfelder</h3>
    <p>(Analyse der Ambivalenzen / Reibung - in direkter Du-Ansprache)</p>
    <h3>Diagnostischer Ausblick</h3>
    <p>(Ein prägnanter, therapeutischer Blick auf Deine Entwicklungsaufgabe)</p>
    

    // ... (Obiger Code bleibt unverändert)

    2. VISUAL DESCRIPTION FÜR DEN BILDGENERATOR:
    Übersetze die psychologische Dynamik in ein abstraktes Bild. Halte dich EXAKT an diese Vorgaben, um den Stil der Karten zu treffen:
    - ÜBERSETZUNG: Verwende für den Prompt NIEMALS die direkten Namen der Karten. Übersetze ihre Bedeutung in 4 bis 5 englische Keywords für abstrakte Emotionen.
    - STIL: Primitiver, roher Expressionismus / Art Brut, analoges Vintage-Gouache-Gemälde auf rauem, gealtertem Papier. Kein digitaler Look.
    - KOMPOSITION: DICHT, FRENETISCH und ALL-OVER (das gesamte Bild ist gefüllt, kein Weißraum). Chaotisches Aufeinandertreffen von klobigen, primitiven Formen. Randabfallend.
    - LINIEN: EXTREM DICKE, schwere, unkontrollierte, zackige und unsaubere schwarze Trockenpinsel-Tusche-Konturen (gestisch), die wild über das Bild tanzen. Man muss die Borsten sehen.
    - FARBEN: SATT, OPAK, kontrastreich und ungemischt (Primärfarben). Die Farben überlappen sich chaotisch, sind fleckig und zeigen sichtbare Pinselspuren und Farbbluten. NOCH MEHR TEXTUR.

    ANTWORTE STRENG IM JSON-FORMAT WIE FOLGT (ohne Zeilenumbrüche im String!):
    {
      "interpretation": "Deine HTML Analyse...",
      "visual_description": "A dense, chaotic, borderless scan of a crude, vintage Art Brut gouache painting on rough, aged paper. The style is raw, frenetic mid-century abstract expressionism. The composition is ALL-OVER and dense, filled with a chaotic clash of Large, bold, clumsy, and naive archetypal shapes. NO Minimalism, NO empty paper space. The entire canvas is used. The shapes are defined by EXTREMELY THICK, heavy, unrefined, and erratic black dry-brush ink contour lines, as if painted with a large, messy, ruined brush. Visibility of brush bristles throughout. Inside and overlapping these messy outlines, shapes are filled with raw, solid, unmixed, highly vibrant, and opaque primary colors that reflect the psychological feeling of [FÜGE HIER DEINE 4-5 ENGLISCHEN EMOTIONS-KEYWORDS EIN]. Colors must bleed into the paper grain. The color application is messy, unmixed, and occasional color bleeding. NO clean lines, NO smooth gradients, NO symmetry, NO perfect geometry, NO text. The image looks like a raw, unedited psychological artifact. Aspect Ratio: 2:3"
    }`;

// ... (Restlicher Fetch-Code bleibt unverändert)



// ... [Restlicher Fetch-Code bleibt gleich] ...

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