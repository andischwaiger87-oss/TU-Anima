import { cards } from '../data/cards';

const API_KEY_STORAGE = 'tuanima_openai_key';

// Hier greifen wir auf die .env-Datei zu (Syntax gilt für Vite)
const ENV_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const getApiKey = () => {
    // 1. Schau nach, ob ein Key im Browser gespeichert ist
    const localKey = localStorage.getItem(API_KEY_STORAGE);
    
    // 2. Nimm den lokalen Key, oder (falls leer) den Key aus der .env Datei
    return localKey || ENV_API_KEY;
};

export const setApiKey = (key) => localStorage.setItem(API_KEY_STORAGE, key);

export const generateSoulCard = async (selectionData) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key missing");
    
    // ... hier geht dein Code ganz normal weiter ...

export const getApiKey = () => localStorage.getItem(API_KEY_STORAGE);
export const setApiKey = (key) => localStorage.setItem(API_KEY_STORAGE, key);

export const generateSoulCard = async (selectionData) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key missing");

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

    // 2. Call Text API
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

    if (!textResponse.ok) throw new Error("Text API Error");
    const textData = await textResponse.json();
    const interpretation = textData.choices[0].message.content;

    // 3. Call Image API
    const imagePrompt = `Abstract surrealistic soul card art. Psychological symbolism: ${posFav1} and ${posFav2} (light/positive aspects) contrasting with ${negFav1} (shadow aspects). Artistic style: Modern abstract expressionism, vibrant colors, premium texture.`;

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
            style: "vivid"
        })
    });

    if (!imageResponse.ok) throw new Error("Image API Error");
    const imageData = await imageResponse.json();

    return {
        interpretation,
        imageUrl: imageData.data[0].url
    };
};
