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
        // NEU: GPT-4o liefert nicht nur Keywords, sondern ein strukturiertes BILD-BRIEFING
        // mit konkreten visuellen Direktiven (Palette, Komposition, Bewegung, etc.).
        // Das ist der Hauptkanal für die Differenzierung zwischen verschiedenen Karten-Auswahlen.
        const systemPrompt = `Du bist ein hochqualifizierter Tiefenpsychologe nach der Lehre von Dr. Heinrich Reich (TU-Anima Bildertest).
        Deine Aufgabe ist eine hochgradig individuelle psychologische Diagnose UND ein strukturiertes visuelles Briefing für ein gemaltes Seelenbild im Stil der Original-Anima-Karten (Gouache/Aquarell auf Papier).

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

        2. BILD-BRIEFING (für die malerische Bildgenerierung):
        Übersetze die seelische Konstellation in KONKRETE VISUELLE Entscheidungen. Schreibe in englischer Sprache, prägnant, sinnlich, präzise. Nutze KEINE Kartennamen (kein "sun", "moon", "snake" etc.), sondern die abstrakten Formqualitäten und Energien dahinter. Die einzelnen Felder MÜSSEN voneinander abweichen, je nachdem welche Karten gewählt wurden — eine Saturn-dominierte Auswahl liefert eine andere Palette als eine Sonne-/Jupiter-dominierte.

        Die sieben Felder im image_brief:
        - palette: 2–4 dominierende Farben in präziser Sprache. ZWINGEND mindestens EINE dunkle/tiefe Farbe enthalten (near-black, deep indigo, burnt umber, charcoal o.ä.) als tonaler Anker. Beispiel: "deep indigo, bone white, vermillion accents, charcoal black". Die Palette MUSS die emotionale Grundtemperatur widerspiegeln (schwer/dunkel vs. strahlend/warm vs. nächtlich-kühl vs. polychrom-vibrierend).
        - composition: Die Grundarchitektur als EIN zentrales asymmetrisches Motiv mit innerer Spannung. NIEMALS ein wiederholendes Muster, Gitter, Tapeten-Design oder eine regelmäßige Wellen-Reihe. Beispiele: "one heavy weighted form sitting low in the frame with tension pulling upward", "a single coiled spiral occupying the center, off-balance to the right", "a tall vertical column dividing the field unevenly with a smaller counter-form in the corner", "fragmented shapes converging toward an empty center".
        - motif_character: Charakter der Hauptformen, z.B. "interlocking jagged shapes with sharp angles", "soft curving organic forms melting into each other", "thick coiling spirals broken by hard edges", "tall vertical columns of color".
        - movement: Die Bewegungsenergie, z.B. "slow, weighted, downward-pulled", "fast outward burst, centrifugal", "static and contemplative", "restless oscillating tension".
        - density: Verteilung, z.B. "crowded center, sparse edges", "evenly distributed across the field", "concentrated in one corner with empty space dominating".
        - brushwork_quality: Pinselführung, z.B. "wet broad strokes with visible drag marks", "dry-brushed scratchy lines", "thick impasto with palette knife scrapes", "translucent washes layered over each other".
        - mood_descriptor: 1–2 prägnante englische Adjektive, z.B. "melancholic-defiant", "jubilant-anxious", "serene-hollow", "feverish-luminous".

        ANTWORTE STRENG IM JSON-FORMAT WIE FOLGT (ohne Zeilenumbrüche in den JSON-Werten):
        {
          "interpretation": "Deine HTML Analyse...",
          "image_brief": {
            "palette": "...",
            "composition": "...",
            "motif_character": "...",
            "movement": "...",
            "density": "...",
            "brushwork_quality": "...",
            "mood_descriptor": "..."
          }
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
                temperature: 0.85
            })
        });

        if (!textResponse.ok) throw new Error(`Text API Error: ${textResponse.status}`);
        const textData = await textResponse.json();
        const resultJson = JSON.parse(textData.choices[0].message.content);
        const brief = resultJson.image_brief || {};

        // 5. Finalen Bild-Prompt aus dem Briefing zusammenbauen.
        // NEU: Positiv formuliert. Kein "AVOID Keith Haring" mehr. Stattdessen so dicht gouache/painterly beschrieben,
        // dass für den Siebdruck-Look kein Platz mehr bleibt. Strukturierte Labels statt Fließtext.
        const finalImagePrompt = `An abstract painted soul-image in the style of 1950s European psychological symbol cards (TU-Anima tradition).

Use the attached input images ONLY as a STYLE reference — extract their medium, brushwork, paint saturation, tonal contrast, and offset-print grain. Do NOT copy their composition or motifs. Invent a completely NEW abstract motif as specified below.

Medium: heavily saturated opaque gouache and tempera on watercolor paper, applied WET and THICK with a loaded sable brush. Brushstrokes are bold and confident with strong directional drag marks, occasional impasto ridges, pigment pooling at stroke ends, and wet color bleeding into neighboring strokes. Some passages use translucent overlapping washes; other passages are densely opaque. The image MUST contain deep saturated darks — near-black, deep indigo, burnt umber, or charcoal — somewhere in the composition, providing strong tonal contrast against the lighter mid-tones and highlights. This is NOT colored-pencil, NOT pastel, NOT dry — it is wet painted gouache. The whole image is photographed from a 1950s European printed book plate, so a clearly visible offset-print halftone rosette pattern (fine magenta–cyan–yellow dot grid) overlays the entire image and the colors are slightly muted by print aging. Edges of color fields are organic and hand-painted, never crisp or geometric.

Palette: ${brief.palette}.
Composition: ${brief.composition}.
Motif character: ${brief.motif_character}.
Movement: ${brief.movement}.
Density: ${brief.density}.
Brushwork: ${brief.brushwork_quality}.
Mood: ${brief.mood_descriptor}.

The image is ONE expressive abstract painted composition with a clearly identifiable central focal motif — NOT a repeating decorative pattern, NOT wallpaper, NOT a tiled design, NOT a regular wave pattern. The composition is asymmetric and hand-arranged, with strong directional tension between the forms. The motif is fully abstract — pure painted color forms, no figures, no faces, no recognizable objects. The painted image fills the entire frame edge to edge, no white margin, no border, no frame.`;

        // 6. Style-Referenz-Karten als Blobs laden (die 2 positiven Favoriten).
        // Wir holen sie über den eigenen Origin (Cloudflare Pages serviert /cards/* als Static Asset).
        const origin = new URL(context.request.url).origin;
        const refPaths = [posFav1?.imagePath, posFav2?.imagePath].filter(Boolean);

        const refBlobs = [];
        for (const p of refPaths) {
            const refResponse = await fetch(`${origin}${p}`);
            if (!refResponse.ok) {
                console.warn(`⚠️ Referenzkarte nicht ladbar: ${p} (${refResponse.status})`);
                continue;
            }
            refBlobs.push(await refResponse.blob());
        }

        // 7. OpenAI Image EDIT API aufrufen (multipart/form-data mit Style-Referenzen)
        const form = new FormData();
        form.append('model', 'gpt-image-1');
        form.append('prompt', finalImagePrompt);
        form.append('n', '1');
        form.append('size', '1024x1536');
        form.append('quality', 'high');
        refBlobs.forEach((blob, i) => {
            // OpenAI erwartet bei mehreren Bildern den Key 'image[]'
            form.append('image[]', blob, `style_ref_${i}.webp`);
        });

        const imageResponse = await fetch('https://api.openai.com/v1/images/edits', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
                // Kein Content-Type setzen — fetch setzt den Multipart-Boundary automatisch.
            },
            body: form
        });

        if (!imageResponse.ok) {
            const errorDetails = await imageResponse.json().catch(() => ({}));
            console.error("🚨 IMAGE EDIT API FEHLER:", JSON.stringify(errorDetails, null, 2));
            throw new Error(`Image API Error ${imageResponse.status}: ${errorDetails?.error?.message || "Unbekannter Fehler"}`);
        }

        const imageData = await imageResponse.json();
        const imgDataBlock = imageData.data[0];

        // Der Edit-Endpoint liefert immer base64 (kein URL). Wir bauen daraus eine Data-URL fürs Frontend.
        let finalImage = "";
        if (typeof imgDataBlock === 'string') {
            finalImage = imgDataBlock;
        } else if (imgDataBlock?.b64_json) {
            finalImage = `data:image/png;base64,${imgDataBlock.b64_json}`;
        } else {
            finalImage = imgDataBlock?.url || imgDataBlock?.image_url || JSON.stringify(imgDataBlock);
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
