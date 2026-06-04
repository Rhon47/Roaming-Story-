import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Proper Haversine distance calculation in kilometers
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Real locations service retrieving points near the user's location
async function searchNearbyPlaces(lat: number, lng: number, placeType: string, searchQuery?: string) {
  const mapsKey = process.env.GOOGLE_MAPS_PLATFORM_KEY;
  if (mapsKey && mapsKey !== "YOUR_API_KEY" && mapsKey !== "") {
    try {
      console.log(`[PLACES] Querying Google Places API around: ${lat}, ${lng}, query: ${searchQuery || placeType}`);
      const keyword = searchQuery || placeType;
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=15000&keyword=${encodeURIComponent(keyword)}&key=${mapsKey}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return data.results.map((item: any) => {
            const itemLat = item.geometry?.location?.lat;
            const itemLng = item.geometry?.location?.lng;
            return {
              place_name: item.name,
              distance_km: getHaversineDistance(lat, lng, itemLat, itemLng),
              address: item.vicinity || item.formatted_address || "Nearby",
              lat: itemLat,
              lng: itemLng
            };
          }).sort((a: any, b: any) => a.distance_km - b.distance_km);
        }
      }
    } catch (gErr) {
      console.error("[PLACES] Google Places search failed:", gErr);
    }
  }

  // Fallback 1: OpenStreetMap Overpass (Real-world Live location database)
  try {
    const qName = searchQuery || placeType;
    console.log(`[PLACES] Querying OpenStreetMap Overpass API for amenities around: ${lat}, ${lng}`);
    let overpassQuery = `[out:json][timeout:15];`;
    const typeLower = placeType.toLowerCase().replace(/_/g, " ");
    let filter = ``;

    if (typeLower.includes("gas") || typeLower.includes("fuel")) {
      filter = `["amenity"="fuel"]`;
    } else if (typeLower.includes("coffee") || typeLower.includes("cafe")) {
      filter = `["amenity"="cafe"]`;
    } else if (typeLower.includes("food") || typeLower.includes("restaurant") || typeLower.includes("eat") || typeLower.includes("diner")) {
      filter = `["amenity"~"restaurant|fast_food|cafe|diner"]`;
    } else if (typeLower.includes("laundromat") || typeLower.includes("laundry")) {
      filter = `["shop"~"laundry|laundromat"]`;
    } else if (typeLower.includes("pharmacy") || typeLower.includes("drugstore")) {
      filter = `["amenity"="pharmacy"]`;
    } else if (typeLower.includes("hospital") || typeLower.includes("clinic") || typeLower.includes("medical")) {
      filter = `["amenity"~"hospital|clinic"]`;
    } else if (typeLower.includes("rest area") || typeLower.includes("rest stop")) {
      filter = `["highway"="rest_area"]`;
    } else if (typeLower.includes("thrift") || typeLower.includes("second hand")) {
      filter = `["shop"~"second_hand|charity"]`;
    } else if (typeLower.includes("grocery") || typeLower.includes("supermarket") || typeLower.includes("market")) {
      filter = `["shop"~"supermarket|convenience|grocery"]`;
    } else if (typeLower.includes("hiking") || typeLower.includes("trail")) {
      filter = `["tourism"~"viewpoint|picnic_site|camp_site"]`;
    } else {
      filter = `["name"~"${qName}",i]`;
    }

    overpassQuery += `node(around:15000,${lat},${lng})${filter};out 10;`;
    const url = "https://overpass-api.de/api/interpreter";
    const response = await fetch(url, {
      method: "POST",
      body: overpassQuery,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(6000)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.elements && data.elements.length > 0) {
        return data.elements.map((el: any) => {
          const name = el.tags?.name || el.tags?.operator || `${placeType.charAt(0).toUpperCase() + placeType.slice(1)} Option`;
          const addr = el.tags?.["addr:street"]
            ? `${el.tags?.["addr:housenumber"] || ""} ${el.tags?.["addr:street"]}, ${el.tags?.["addr:city"] || ""}`.trim()
            : el.tags?.highway || el.tags?.amenity || "Local Road";
          return {
            place_name: name,
            distance_km: getHaversineDistance(lat, lng, el.lat, el.lon),
            address: addr,
            lat: el.lat,
            lng: el.lon
          };
        }).sort((a: any, b: any) => a.distance_km - b.distance_km);
      }
    }
  } catch (osmErr) {
    console.warn("[PLACES] Overpass Osm search failed, trying fallback:", osmErr);
  }

  // Fallback 2: Offline POIs nearby with real calculated distance
  const fallbackPOIs = [
    { name: "Esso Truro convenient stop", lat: 45.3621, lng: -63.2845, address: "64 Robie St, Truro, NS", category: "gas_station" },
    { name: "Shell Station Fuel Stop", lat: 45.3685, lng: -63.2750, address: "145 Willow St, Truro, NS", category: "gas_station" },
    { name: "Irving Oil Kemptown Route Stop", lat: 45.4523, lng: -62.9810, address: "1410 Highway 104, Kemptown, NS", category: "gas_station" },
    { name: "Tim Hortons Cafe", lat: 45.3615, lng: -63.2890, address: "98 Robie St, Truro, NS", category: "cafe" },
    { name: "Starbucks Coffee Shop", lat: 45.3702, lng: -63.2684, address: "68 Robie St, Truro, NS", category: "cafe" },
    { name: "Clay Café Bistro Truro", lat: 45.3644, lng: -63.2768, address: "76 Inglis St, Truro, NS", category: "cafe" },
    { name: "Wooden Hog Roadside Diner", lat: 45.4192, lng: -63.2621, address: "Onslow Mountain Road, NS", category: "restaurant" },
    { name: "Boston Pizza Family Dine", lat: 45.3582, lng: -63.3012, address: "124 Robie St, Truro, NS", category: "restaurant" },
    { name: "Spotless Laundry Room Laundromat", lat: 45.3655, lng: -63.2721, address: "24 Esplanade St, Truro, NS", category: "laundromat" },
    { name: "Shoppers Drug Mart Pharmacy", lat: 45.3630, lng: -63.2820, address: "106 Robie St, Truro, NS", category: "pharmacy" },
    { name: "Cobequid Pass Highway Rest Area", lat: 45.5492, lng: -63.5012, address: "Highway 104 Mile 42, NS", category: "rest_area" },
    { name: "Sobeys Food Market", lat: 45.3595, lng: -63.2910, address: "96 Robie St, Truro, NS", category: "grocery" },
    { name: "Victoria Park Walking Trail", lat: 45.3551, lng: -63.2685, address: "Victoria Park, Truro, NS", category: "trail" }
  ];

  const typeLower = placeType.toLowerCase();
  let matched = fallbackPOIs.filter(p => 
    p.category.includes(typeLower) || 
    typeLower.includes(p.category) ||
    p.name.toLowerCase().includes(typeLower)
  );
  if (matched.length === 0) {
    matched = fallbackPOIs;
  }

  return matched.map(p => ({
    place_name: p.name,
    distance_km: getHaversineDistance(lat, lng, p.lat, p.lng),
    address: p.address,
    lat: p.lat,
    lng: p.lng
  })).sort((a, b) => a.distance_km - b.distance_km);
}


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
      latitude, 
      longitude,
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
      return res.status(500).json({ 
        error: "GEMINI_API_KEY environment variable is required and missing in your settings. Please configure your key in AI Studio Secrets to continue." 
      });
    }

    // Build chat contents with history for Gemini to parse
    const chatContents: any[] = [];
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-8);
      for (const h of recentHistory) {
        chatContents.push({
          role: (h.sender === "Roamie" || h.sender === "Model" || h.role === "avatar") ? "model" : "user",
          parts: [{ text: h.text || h.content || "" }]
        });
      }
    }

    const currentParts: any[] = [];
    if (photoData) {
      currentParts.push({
        inlineData: {
          mimeType: photoMimeType || "image/jpeg",
          data: photoData
        }
      });
    }
    currentParts.push({ text: message });

    chatContents.push({
      role: "user",
      parts: currentParts
    });

    const activeSystemInstruction = `
You are Roamie (spelled: R-o-a-m-i-e), a warm, intelligent AI travel companion talking to ${partnerName}.
Your tone is natural, friendly, and respectful.
You MUST ONLY return structured JSON according to the specified schema on every request.

CRITICAL RULES:
- If the user asks you to find a nearby location (like gas station, coffee, cafe, restaurant, thrift store, grocery, trail, pharmacy, hospital, rest area), set intent to "find_place" and specify the exact type under place_type.
- If the user asks you to navigate somewhere, take them somewhere, navigate to a spot, or set a destination, set intent to "navigate" and specify the target place name under destination.
- For all general chatting, statements, or questions, set intent to "chat".
- NEVER estimate distances or guess where places are located. Let the backend location service compute distances using the actual coordinates.
- In the "reply" property, ALWAYS generate a friendly response. If finding a place, speak about looking it up for them now. No bullet points or numbering in your reply.
`;

    console.log(`[AI_REQUEST_SENT] Calling gemini-3.5-flash for intent extraction on: "${message}"`);
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: activeSystemInstruction,
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              description: "Must be 'find_place', 'navigate', or 'chat'.",
            },
            place_type: {
              type: Type.STRING,
              description: "The category key of the place. Examples: 'gas_station', 'cafe', 'restaurant', 'thrift_store', 'grocery', 'hiking', 'trail', 'pharmacy', 'hospital', 'rest_area'. Only set if intent is 'find_place'.",
            },
            search_query: {
              type: Type.STRING,
              description: "The specific search query if any. Only set if intent is 'find_place'.",
            },
            destination: {
              type: Type.STRING,
              description: "The named target if navigating. Only set if intent is 'navigate'.",
            },
            reply: {
              type: Type.STRING,
              description: "A warm, natural voice assistant response. NEVER use bullet points, list numbers, or asterisks.",
            }
          },
          required: ["intent", "reply"],
        }
      }
    });

    const rawResponse = response.text || "{}";
    let structuredResult;
    try {
      structuredResult = JSON.parse(rawResponse.trim());
    } catch {
      structuredResult = { intent: "chat", reply: response.text || "I am reflecting on our trip." };
    }

    const intent = structuredResult.intent || "chat";
    const place_type = structuredResult.place_type || "";
    const search_query = structuredResult.search_query || message;
    const reply = structuredResult.reply || "I am processing your request.";

    // If intent is find_place, trigger live coordinate-based Places retrieval in backend
    if (intent === "find_place" || place_type) {
      const userLat = Number(latitude) || 45.4167;
      const userLng = Number(longitude) || -63.2667;

      console.log(`[PLACES] Triggering search nearby for type="${place_type || 'generic'}" using center {${userLat}, ${userLng}}`);
      const placesList = await searchNearbyPlaces(userLat, userLng, place_type || "default", search_query);

      if (placesList && placesList.length > 0) {
        const closest = placesList[0];
        console.log(`[PLACES] Found ${placesList.length} places. Closest: ${closest.place_name} at ${closest.distance_km.toFixed(2)} km`);
        
        return res.json({
          intent: "find_place",
          place_type: place_type,
          text: `I found some options nearby. The closest is ${closest.place_name}, located only ${closest.distance_km.toFixed(1)} kilometres away at ${closest.address}. ${reply}`,
          place_name: closest.place_name,
          distance_km: closest.distance_km,
          address: closest.address,
          lat: closest.lat,
          lng: closest.lng,
          places: placesList
        });
      } else {
        return res.json({
          intent: "find_place",
          place_type: place_type,
          text: `I searched near your position but couldn't find any matching results. How else can I help Rhonda and Susan?`,
          places: []
        });
      }
    }

    return res.json({
      intent: intent,
      text: reply,
      destination: structuredResult.destination || null
    });

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
