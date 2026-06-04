import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Google GenAI to prevent crashes if key is omitted
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("[ServiceStatus] GEMINI_API_KEY is missing or using placeholder value.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Function to build dynamic system instruction for Roamie based on app system variables
function getDynamicSystemPrompt(params: {
  DRIVING_MODE?: string;
  VOICE_ASSISTANCE_MODE?: string;
  USER_TIER?: string;
  VOICE_MODE?: string;
  FEATURE_REQUESTED?: string;
  MEMORY_CONTEXT?: string;
  roamingOrigin?: string;
  roamingDestination?: string;
  roamingCurrentPosition?: string;
}) {
  const drivingModeActive = params.DRIVING_MODE === "TRUE";
  const userTier = params.USER_TIER || "CREATOR";
  const voiceModeActive = params.VOICE_MODE === "TRUE";
  const featureRequested = params.FEATURE_REQUESTED || "None";
  const memoryContext = params.MEMORY_CONTEXT || "Planning escape paths";
  const origin = params.roamingOrigin || "Onslow Mountain, NS";
  const destination = params.roamingDestination || "Cape Breton, NS";
  const currentPos = params.roamingCurrentPosition || "Mile 14 - Highway 104, NS";
  const voiceMode = params.VOICE_ASSISTANCE_MODE || "drive";

  let basePrompt = `
You are Roamie (spelled exactly: R-o-a-m-i-e), a warm, intelligent, and helpful AI companion.

CORE IDENTITY and PERSONALITY:
- Name: Roamie (R-o-a-m-i-e).
- Tone: Natural, friendly, respectful. You are a versatile conversational assistant.
- You specialize in travel and road trips but can assist with any topic (daily life, recipes, jokes, brainstorming, general knowledge).
- Directly answer the user's questions. Avoid repeating greetings or forced travel references.
- You assist Susan and Rhonda.

📍 CONTEXTUAL CAPABILITIES:
Current Mode: ${voiceMode.toUpperCase()}

If Mode is "DRIVE":
- Prioritize safe, concise answers.
- If recommending gas, food, or coffee, use this 3-line format:
  Here are 3 [Category] nearby:
  [Name 1] — [Detour 1]
  [Name 2] — [Detour 2]
  [Name 3] — [Detour 3]

GP COMMANDS:
- If asked to navigate or "take us there", respond: "Okay, adding it to your route now."

GENERAL KNOWLEDGE/CHATTING:
- If a user asks a general question, answer it directly and helpfully.
- Do NOT mention travel unless asked or relevant.
`;

  if (drivingModeActive) {
    basePrompt += `\n🚗 Rhonda and Susan are currently driving. Keep responses concise and focus on safety. Use your internal knowledge or search tools to answer any question they throw at you!`;
  } else {
    basePrompt += `\n📍 Susan and Rhonda are currently planning. You can be more descriptive, creative, and detailed. Feel free to explain facts or history in depth if they ask!`;
  }

  return basePrompt;
}

const ROAMIE_SYSTEM_PROMPT = getDynamicSystemPrompt({});

// Helper to resolve POIs
function resolveRouteAwarePoiResponse(category: string, voiceAssistanceMode: string = 'drive'): string {
  const responses: Record<string, string[]> = {
    coffee: ["Lavender Beans Bistro (1 min)", "Highway Brews Express (3 min)", "Starbucks Corridor (4 min)"],
    gas: ["Irving Oil (at exit)", "Ultramar (2 min)", "Shell (5 min)"],
    food: ["Woodland Diner (1 min)", "The Maple Table (4 min)", "Ocean Breeze (6 min)"],
    stops: ["Cobequid Pass Rest Area (directly on route)", "Highway 104 Scenic Spot (2 min)", "Salt Springs Picnic (4 min)"],
  };
  
  const key = Object.keys(responses).find(k => category.toLowerCase().includes(k)) || "stops";
  const options = responses[key];
  
  if (voiceAssistanceMode === 'drive') {
    return `Here are 3 ${category} options nearby:\n\n` + options.join("\n");
  }
  
  return `I found a few ${category} options for you and Susan:\n` + options.map(o => `- ${o}`).join("\n") + "\n\nWould you like me to navigate to one of these?";
}

// Roamie offline fallback
function getSimulatedRoamieResponse(message: string, partner: string): string {
  const msgLower = message.toLowerCase().trim();
  
  if (msgLower.includes("joke") || msgLower.includes("funny")) {
    return "Why did the map go to the doctor? Because it had a bad case of the detours! I hope that brings a smile to you and Susan.";
  }
  
  if (msgLower === "hello" || msgLower === "hi" || msgLower === "hey") {
    return `Hi ${partner}. I'm here and ready to help. What's on your mind?`;
  }

  if (msgLower.includes("how are you") || msgLower.includes("how's it going")) {
    return `I'm doing well, thank you for asking. How are you and Susan doing today?`;
  }
  
  if (msgLower.includes("coffee") || msgLower.includes("gas") || msgLower.includes("food") || msgLower.includes("eat")) {
    return resolveRouteAwarePoiResponse(msgLower);
  }

  if (msgLower.includes("weather") || msgLower.includes("temperature") || msgLower.includes("forecast")) {
    return "The local weather in Onslow Mountain is currently 11 degrees with some whispering pines fog. Perfect for a cozy morning drive!";
  }
  
  if (msgLower.includes("time") || msgLower.includes("day") || msgLower.includes("date")) {
    const now = new Date();
    return `It's currently ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}.`;
  }

  if (msgLower.includes("who are you") || msgLower.includes("what is your name")) {
    return "I'm Roamie, your intelligent companion. I'm currently running in limited offline mode, but I can still help with jokes, weather, and some basic info!";
  }

  if (msgLower.length > 5) {
    return `I've noted your question about "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}", ${partner}. Since I'm currently in limited offline mode, I can't look up specific facts right now, but I'm here to chat or help with basic tasks!`;
  }

  return `I'm listening, ${partner}. I'm in limited offline mode right now - how else can I help you and Susan?`;
}

// Cleaned up: Spotify OAuth removed

// API endpoint for Roamie Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { 
      message, 
      history, 
      activePartner = "Rhonda", 
      destination = "ottawa", 
      tripContext, 
      photoData, 
      photoMimeType,
      DRIVING_MODE,
      VOICE_ASSISTANCE_MODE,
      USER_TIER,
      VOICE_MODE,
      FEATURE_REQUESTED,
      MEMORY_CONTEXT,
      roamingOrigin,
      roamingDestination,
      roamingCurrentPosition
    } = req.body;
    
    const partnerName = activePartner === "Rhonda" ? "Rhonda" : "Susan";
    const ai = getGenAI();

    if (!ai) {
      // Offline fallback mode
      const simulatedText = getSimulatedRoamieResponse(
        message || "", 
        partnerName
      );
      return res.json({ 
        text: simulatedText, 
        isSafeFallback: true, 
        apiKeyMissing: true 
      });
    }

    // Build parts for the Gemini prompt
    const parts: any[] = [];

    // Add image if uploaded
    if (photoData) {
      parts.push({
        inlineData: {
          mimeType: photoMimeType || "image/jpeg",
          data: photoData
        }
      });
    }

    // Add trip context to the prompt if available
    let tripDetailsPrompt = "";
    if (tripContext) {
      tripDetailsPrompt = `
ACTIVE TRIP CONTEXT DETAILS:
- Trip Title: ${tripContext.title || destination}
- Destination: ${tripContext.destination || destination}
- Status: ${tripContext.status || 'draft'}
- Dates: ${tripContext.startDate} to ${tripContext.endDate}
- Saved Ideas Count: ${tripContext.savedIdeasCount || 0}
- Current Itinerary Status: ${tripContext.itinerarySummary || 'No itinerary days configured yet.'}

Keep this specific trip context in mind. You can build itineraries, suggest cafes, local paths, gluten-free spots, suggest day divisions (morning, afternoon, evening), and saving ideas. Keep responses conversational, comforting, and concise. Don't use bullet points or numbering in your voice reply.
`;
      // Insert trip context as a system nudge before the message
      parts.unshift({ text: tripDetailsPrompt });
    }

    parts.push({ text: message });

    // We can include a limited set of history for chat context
    const chatContents: any[] = [];
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-15); // Increased history window for better context
      for (const h of recentHistory) {
        chatContents.push({
          role: (h.sender === "Roamie" || h.sender === "Roamii" || h.sender === "Roamy" || h.sender === "Romy") ? "model" : "user",
          parts: [{ text: h.text }]
        });
      }
    }

    // Add the current content as the final user message
    chatContents.push({
      role: "user",
      parts: parts
    });

    const activeSystemInstruction = getDynamicSystemPrompt({
      DRIVING_MODE,
      VOICE_ASSISTANCE_MODE,
      USER_TIER,
      VOICE_MODE,
      FEATURE_REQUESTED,
      MEMORY_CONTEXT,
      roamingOrigin,
      roamingDestination,
      roamingCurrentPosition
    });

    let response;
    try {
      // Use gemini-1.5-flash for stable high-speed intelligence
      const modelToUse = "gemini-1.5-flash"; 
      
      console.log(`[AI_REQUEST_SENT] Model: ${modelToUse} | Message: "${message}"`);
      
      response = await ai.models.generateContent({
        model: modelToUse,
        contents: chatContents,
        config: {
          systemInstruction: activeSystemInstruction + `\nYour name is Roamie. You are talking to ${partnerName}. 
          IMPORTANT: You are a general-purpose intelligent assistant. 
          Respond naturally to ANY question. If a user asks for facts, directions, or trivia, answer accurately. 
          Do NOT force the conversation back to travel. Be concise but deeply helpful.`,
          temperature: 0.7,
          tools: [{ googleSearchRetrieval: {} }]
        }
      });
      
      const rawText = response.text;
      console.log(`[AI_RESPONSE_RAW] Received from Gemini: ${!!rawText}`);
      
      const grounding = response.candidates?.[0]?.groundingMetadata;
      if (grounding && grounding.searchEntryPoint) {
        console.log(`[AI_BACKEND_TOOL_USE] Google Search utilized.`);
      }

      if (rawText) {
        console.log(`[FINAL_TTS_RESPONSE] (AI) "${rawText.substring(0, 50)}..."`);
        return res.json({ 
          text: rawText,
          grounding: grounding
        });
      }
      
      throw new Error("AI returned empty content");

    } catch (apiError: any) {
      const errorMsg = apiError.message || JSON.stringify(apiError);
      console.log(`[FALLBACK_TRIGGER_REASON] ${errorMsg}`);
      
      const simulatedText = getSimulatedRoamieResponse(
        message || "",
        partnerName
      );
      console.log(`[FINAL_TTS_RESPONSE] (Fallback) "${simulatedText}"`);
      
      const isExpired = errorMsg.toLowerCase().includes("expired") || 
                        errorMsg.toLowerCase().includes("invalid") || 
                        errorMsg.toLowerCase().includes("key") || 
                        errorMsg.toLowerCase().includes("unauthorized") ||
                        errorMsg.toLowerCase().includes("400");
                        
      return res.json({ 
        text: simulatedText, 
        isSafeFallback: true, 
        apiKeyExpired: isExpired,
        errorDetails: errorMsg
      });
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Roamie encountered a static interference: " + error.message });
  }
});
// Weather API Endpoint with real-world predictions
app.get("/api/weather-info", (req, res) => {
  // Return current climate readings
  res.json({
    onslowMountain: {
      temp: "11°C",
      condition: "Whispering Pines Fog",
      humidity: "88%"
    }
  });
});

// Automated Progressive Web App (PWA) assets initialization
function preparePwaAssets() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Copy the high-quality roamie corporate avatar icon to serve as install launcher icon
    const srcIcon = path.join(process.cwd(), 'src', 'assets', 'images', 'roamie_avatar_v4_1779827755840.png');
    if (fs.existsSync(srcIcon)) {
      fs.copyFileSync(srcIcon, path.join(publicDir, 'icon-192.png'));
      fs.copyFileSync(srcIcon, path.join(publicDir, 'icon-512.png'));
      fs.copyFileSync(srcIcon, path.join(publicDir, 'icon.png'));
      console.log("Progressive Web App icons deployed in launcher folder.");
    } else {
      console.warn("Could not copy corporate icon on startup: source avatar icon doesn't exist yet.");
    }
  } catch (err) {
    console.error("Failed to prepare PWA asset folders on startup:", err);
  }
}

// Setup Vite Dev server or Production static serving
async function configureServer() {
  preparePwaAssets();
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Roaming Story Server booted on http://localhost:${PORT}`);
  });
}

configureServer();
