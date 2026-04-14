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

    // 4. DER AKTUALISIERTE, KORRIGIERTE SYSTEM-PROMPT
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
    
    2. VISUAL DESCRIPTION FÜR DEN BILDGENERATOR (KORRIGIERT FÜR AUTHENTIZITÄT):
    Übersetze die psychologische Dynamik in ein abstraktes Bild. Halte dich EXAKT an diese Vorgaben, um ein analoges Artefakt zu simulieren:
    - PRÄSENTATION: Ein flacher, hochauflösender Scan eines sauberen Kunstdrucks. Ein schmaler, **reinweißer Papierrand** umrahmt das zentrale Motiv. Der Hintergrund des Bildes *innerhalb* des Motivs muss oft **reinweiß oder sehr hell** sein, um die Farben leuchten zu lassen.
    - STIL: **Hochenergetischer, abstrakter Expressionismus und Fauvismus** (Denke an Kandinsky, Miró, Matisse).
    - LINIEN: Variabel. Nutze eine Mischung aus spontanen, fließenden schwarzen Linien (wie Tinte oder Marker) und Bereichen, die *nur* durch Farbflächen definiert sind (keine schwarzen Outlines). Manche Linien können auch farbig sein. Vermeide einen groben Holzschnitt-Look.
    - FARBEN (WICHTIG): **Maximale Sättigung, Vibranz und Leuchtkraft**. Nutze die **gesamte Palette** leuchtender Primär- und Sekundärfarben: Feuerrot, Magenta, Cyanblau, Ultramarin, Sonnengelb, Orange, Violett, Smaragdgrün, Limettengrün. Matte oder erdige Töne sind STRIKT VERBOTEN. Die Farben müssen leuchten, als wären sie frisch gedruckt.
    - KOMPOSITION: Eine rein abstrakte, naive, symbolische Anordnung von Formen, Wirbeln, Zacken und organischen Strukturen. **KOMPLETT FLACH (2D)**.

    ANTWORTE STRENG IM JSON-FORMAT WIE FOLGT:
    {
      "interpretation": "Deine HTML-Analyse...",
      "visual_description": "A high-resolution, professional, flat scan of a pristine abstract art print on bright white art paper. The artwork is framed by a clean, pure white paper margin. The central abstract composition is in the vibrant style of Lyrical Abstraction and Fauvism, heavily resembling a blend of Kandinsky and Miró's fluid, energetic forms. It features a dynamic mix of spontaneous black ink lines, energetic scribbles, and broad, purely defined fields of highly saturated color. The color palette is full, luminous, and extremely vibrant, using non-earthy, radiant colors including vivid crimson, fuchsia pink, electric turquoise, cobalt blue, intense sunflower yellow, fiery orange, and luminous emerald green. The colored ink texture is matte but the colors are intensely potent and clean. The abstract shapes are a naive, symbolic arrangement of organic loops, sharp geometric clashes, and chaotic emotional outbursts representing the psychological interaction of ${posFav1?.name} and ${posFav2?.name} being obstructed by ${negFav1?.name}. It is strictly flat 2D artwork, absolutely no 3D elements, no digital bevels, no vintage decay, and no rough woodcut texture. The art should pop against the clean white paper."
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
                size: "1024x1792", // Beibehaltung des Hochformats für Karten
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