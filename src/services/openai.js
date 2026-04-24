import { cards } from '../data/cards';

export const generateSoulCard = async (selectionData) => {
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

    // 4. DATEN PAKETIEREN UND AN DAS CLOUDFLARE BACKEND SENDEN
    const payload = {
        posFav1: posFav1 ? { name: posFav1.name, meaning: posFav1.meaning, pos_meaning: posFav1.pos_meaning } : null,
        posFav2: posFav2 ? { name: posFav2.name, meaning: posFav2.meaning, pos_meaning: posFav2.pos_meaning } : null,
        negFav1: negFav1 ? { name: negFav1.name, meaning: negFav1.meaning, neg_meaning: negFav1.neg_meaning } : null,
        posDetails,
        negDetails,
        conflictString
    };

    try {
        console.log("📤 Sende psychologische Daten an sicheres Cloudflare-Backend...");
        
        // Hier rufen wir jetzt die Cloudflare Function auf, nicht mehr OpenAI direkt!
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Server Error: ${errorData.error || response.statusText}`);
        }

        const resultData = await response.json();
        
        console.log("✅ Bild & Diagnose erfolgreich aus dem Backend empfangen!");
        console.timeEnd("⏱️ Gesamtdauer der KI-Generierung");
        console.groupEnd();

        return {
            interpretation: resultData.interpretation,
            imageUrl: resultData.imageUrl
        };

    } catch (error) {
        console.error("🚨 Fehler im TU-Anima Generierungsprozess:", error);
        console.groupEnd();
        throw error;
    }
};