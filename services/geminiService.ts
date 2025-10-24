import { GoogleGenAI, Type } from "@google/genai";
import type { CalculatedData, SoilType, IrrigationSystem } from '../types';

// Fix: Per Gemini API guidelines, the API key must be sourced exclusively from
// `process.env.API_KEY`. Fallbacks or warnings are not permitted.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateAgriculturalData = async (
    cropName: string, 
    fieldSizeHectares: number,
    soilType: SoilType,
    irrigationSystem: IrrigationSystem
): Promise<CalculatedData> => {
    const prompt = `
        Agis comme un expert agronome spécialisé dans les cultures africaines, en particulier pour ${cropName}.
        Pour un champ de ${fieldSizeHectares} hectare(s) en Afrique de l'Ouest, avec un sol de type "${soilType}" et un système d'irrigation "${irrigationSystem}", fournis les estimations suivantes dans un format JSON strict.
        Ne fournis aucune explication, uniquement l'objet JSON.

        Les estimations doivent inclure :
        - 'estimatedGrowthTimeDays': Le temps de croissance total en jours.
        - 'estimatedYieldPerHectareKg': Le rendement estimé en kilogrammes par hectare.
        - 'waterNeedsLiterPerHectarePerDay': Les besoins en eau en litres par hectare et par jour en moyenne.
        - 'laborNeedsHoursPerHectare': Le besoin total en main-d'œuvre en heures par hectare pour tout le cycle.
        - 'estimatedPlantsPerHectare': Le nombre de plants ou boutures recommandés par hectare.
        - 'estimatedBags': Le nombre estimé de sacs de 50kg pour la récolte totale.
        - 'taskCalendar': Un calendrier des tâches essentielles sous forme de tableau d'objets. Chaque objet doit contenir 'task' (nom de la tâche), 'startDay' (jour de début après la plantation), 'endDay' (jour de fin), et 'description' (brève description de la tâche). Le calendrier doit couvrir tout le cycle de croissance.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        estimatedGrowthTimeDays: { type: Type.INTEGER },
                        estimatedYieldPerHectareKg: { type: Type.INTEGER },
                        waterNeedsLiterPerHectarePerDay: { type: Type.INTEGER },
                        laborNeedsHoursPerHectare: { type: Type.INTEGER },
                        estimatedPlantsPerHectare: { type: Type.INTEGER },
                        estimatedBags: {type: Type.INTEGER},
                        taskCalendar: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    task: { type: Type.STRING },
                                    startDay: { type: Type.INTEGER },
                                    endDay: { type: Type.INTEGER },
                                    description: { type: Type.STRING },
                                },
                                required: ["task", "startDay", "endDay", "description"],
                            },
                        },
                    },
                    required: ["estimatedGrowthTimeDays", "estimatedYieldPerHectareKg", "waterNeedsLiterPerHectarePerDay", "laborNeedsHoursPerHectare", "estimatedPlantsPerHectare", "estimatedBags", "taskCalendar"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as CalculatedData;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Impossible de générer les données agricoles. Veuillez vérifier votre clé API et réessayer.");
    }
};