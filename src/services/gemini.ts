import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getChatResponse(message: string, history: { role: "user" | "model"; parts: { text: string }[] }[] = [], systemInstruction: string = "") {
  const model = "gemini-3-flash-preview";
  
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
    history,
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}

export async function* getChatResponseStream(message: string, history: { role: "user" | "model"; parts: { text: string }[] }[] = [], systemInstruction: string = "") {
  const model = "gemini-3-flash-preview";
  
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
    history,
  });

  const stream = await chat.sendMessageStream({ message });
  for await (const chunk of stream) {
    yield chunk.text;
  }
}

export async function generateImage(prompt: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function transcribeAudio(base64Audio: string, mimeType: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: "Transcribe this audio to text. Return only the transcription, nothing else." },
          { inlineData: { data: base64Audio, mimeType } }
        ]
      }
    ]
  });
  return response.text;
}

export async function textToSpeech(text: string, voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Kore') {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return `data:audio/wav;base64,${base64Audio}`;
  }
  return null;
}
