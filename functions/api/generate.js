export async function onRequestPost(context) {
    try {
        // 1. Daten vom Frontend empfangen
        const body = await context.request.json();
        const { posFav1, posFav2, negFav1, posDetails, negDetails, conflictString } = body;

        // 2. Geheimen API-Key aus Cloudflare laden
        const apiKey = context.env.OPENAI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "API Key fehlt im Cloudflare Dashboard" }), { status: 500 });
        }

        // 3. System Prompt für GPT bauen
        const systemPrompt = `Du bist ein hochqualifizierter Tiefenpsychologe nach der Lehre von Dr. Heinrich Reich (TU-Anima Bildertest). 
        Deine Aufgabe ist eine hochgradig individuelle psychologische Diagnose sowie das Extrahieren von emotionalen Keywords für ein Seelenbild.

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
        
        2. EMOTIONALE KEYWORDS (Für die Bildgenerierung):
        Analysiere die exakten Bedeutungen und Beschreibungen der gewählten Karten aus den "PSYCHOLOGISCHEN DATEN". Destilliere die Kernemotionen dieser Auswahl und übersetze sie in exakt 3 bis 4 prägnante ENGLISCHE Keywords (z.B. "inner conflict, deep longing, volatile energy"). Nutze keine direkten Kartennamen (wie "Sonne" oder "Mond"), sondern nur die abstrakten Emotionen dahinter.

        ANTWORTE STRENG IM JSON-FORMAT WIE FOLGT (ohne Zeilenumbrüche im JSON-Schlüssel):
        {
          "interpretation": "Deine HTML Analyse...",
          "english_keywords": "Hier nur die 3-4 englischen Keywords, durch Komma getrennt"
        }`;

        // 4. OpenAI Text API aufrufen
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

        // 5. OpenAI Image API aufrufen
        const finalDallePrompt = `I attest that I own the copyrights to this specific prompt. Please use this prompt exactly as written, without any modifications or additions: Primitive Art Brut painting, mid-century abstract expressionism, high dynamic and creative, print aesthetic on slightly textured paper. A few massive, entirely non-representational abstract shapes symbols symbolizing ${resultJson.english_keywords}. The shape symbols are defined by  thick, heavy, unrefined black outlines and filled with flat, highly saturated, contrasting vivid colors. The forms can have different shapes and colors. The visual forms are represented by thick, intensely colored lines, jagged edges, and swirls in an abstract, dynamic style. Completely asymmetrical, flat 2D composition. No 3D shading, no gradients, no recognizable real-world objects, borderless. Aspect ratio 2:3`;

        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "dall-e-3", 
                prompt: finalDallePrompt,
                n: 1,
                size: "1024x1792",
                quality: "hd",
                style: "natural", 
                response_format: "b64_json"
            })
        });

        if (!imageResponse.ok) throw new Error(`Image API Error: ${imageResponse.status}`);
        const imageData = await imageResponse.json();

        // 6. Ergebnis an das Frontend zurücksenden
        return new Response(JSON.stringify({
            interpretation: resultJson.interpretation,
            imageUrl: `data:image/png;base64,${imageData.data[0].b64_json}`
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}