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
        const finalDallePrompt = `I attest that I own the copyrights to this specific prompt. Please use this prompt exactly as written, without any modifications or additions: A single, vertical abstract artwork in the raw, primitive style of mid-century Art Brut and heavy linocut printmaking. The artwork captures the psychological emotions of: ${resultJson.english_keywords}. The composition features a few bold, distinct, primitive shapes (e.g., spirals, zig-zags, solid blocks). These shapes are defined by VERY THICK, heavy, solid black outlines. The shapes are filled with vivid, opaque, highly saturated primary and secondary colors (deep red, bright yellow, bold blue, earthy orange) using a texture that resembles thick wax crayon or coarse block-print ink. AVOID thin scratchy lines, AVOID messy overlapping scribbles, AVOID fine details, and AVOID gradients. The background is a textured, unpainted off-white cream paper. Flat 2D composition, highly graphic, borderless.`;

        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-image-1", // (oder das Modell, das du gerade nutzt)
                prompt: finalDallePrompt,
                n: 1,
                size: "1024x1536" // <-- HIER AUF DIE NEUE AUFLÖSUNG ÄNDERN
            })
        });

        if (!imageResponse.ok) {
            // Fängt die genaue Begründung von OpenAI ab
            const errorDetails = await imageResponse.json().catch(() => ({})); 
            
            // Schreibt die Details in dein Cloudflare Real-time Log
            console.error("🚨 DALL-E FEHLER-DETAILS:", JSON.stringify(errorDetails, null, 2)); 
            
            // Reicht den echten Fehlertext an dein Frontend (die App) weiter
            throw new Error(`Image API Error ${imageResponse.status}: ${errorDetails?.error?.message || "Unbekannter Fehler"}`);
        }
        
        const imageData = await imageResponse.json();

        // 6. Ergebnis an das Frontend zurücksenden
        const imgDataBlock = imageData.data[0];
        
        // Wir prüfen, ob es ein direkter Text ist, oder fangen die gängigsten neuen Namen ab. 
        // Falls der Name völlig unbekannt ist, schicken wir das Objekt als Text mit, um es zu lesen.
        let finalImage = "";
        if (typeof imgDataBlock === 'string') {
            finalImage = imgDataBlock;
        } else {
            finalImage = imgDataBlock?.url || imgDataBlock?.b64_json || imgDataBlock?.image_url || JSON.stringify(imgDataBlock);
        }

        return new Response(JSON.stringify({
            interpretation: resultJson.interpretation,
            imageUrl: finalImage
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}