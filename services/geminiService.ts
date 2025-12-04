import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Game } from "../types";

// Helper to safely get the AI client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. This feature is only available in the development environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const suggestGameDetails = async (gameTitle: string): Promise<Partial<Game>> => {
  try {
    const ai = getAiClient();
    
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        genre: { type: Type.ARRAY, items: { type: Type.STRING } },
        releaseYear: { type: Type.INTEGER },
        description: { type: Type.STRING, description: "A short, engaging summary of the game in French, under 30 words." },
      },
      required: ["genre", "releaseYear", "description"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide details for the video game "${gameTitle}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    return {
      genre: data.genre,
      releaseYear: data.releaseYear,
      description: data.description
    };

  } catch (error) {
    console.error("Error fetching game details:", error);
    return {
      description: "Impossible de récupérer les infos via IA pour le moment."
    };
  }
};

export const askLibraryAssistant = async (query: string, games: Game[]): Promise<string> => {
  try {
    const ai = getAiClient();
    
    // Create a lean version of the games list to save tokens
    const gamesContext = games.map(g => `${g.title} (${g.status}) - ${g.description || ''}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a helpful assistant for a Twitch streamer's website.
        Here is the list of games in the library:
        ${gamesContext}

        The viewer asks: "${query}"
        
        Answer the viewer in French. Be concise, friendly, and act like a moderator of the channel.
        If the game is not in the list, say so politely.
      `,
    });

    return response.text || "Désolé, je n'ai pas pu analyser la demande.";

  } catch (error) {
    console.error("AI Chat error:", error);
    return "Je suis désactivé pour le moment (API Key manquante ou erreur).";
  }
};