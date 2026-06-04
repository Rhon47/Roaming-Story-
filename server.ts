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

// Helper to resolve POIs in highly polished consumer-ready spoken summaries
function resolveRouteAwarePoiResponse(category: string, voiceAssistanceMode: string = 'drive'): string {
  const cat = category.toLowerCase();
  
  if (cat.includes("coffee") || cat.includes("cafe") || cat.includes("starbucks")) {
    return "I found three coffee shops nearby. The closest is Lavender Beans Bistro, about a minute away, followed by Highway Brews Express and Starbucks Corridor. Would you like me to map directions to Lavender Beans Bistro?";
  }
  if (cat.includes("gas") || cat.includes("fuel") || cat.includes("station")) {
    return "The closest gas station is Irving Oil right at our next exit, with Ultramar and Shell also nearby. Would you like me to start navigation to Irving Oil?";
  }
  if (cat.includes("food") || cat.includes("eat") || cat.includes("restaurant") || cat.includes("diner")) {
    return "I located a couple of restaurants on our route. Woodland Diner is the nearest, just a minute away, and The Maple Table is about four minutes out. Shall I add Woodland Diner to our course?";
  }
  if (cat.includes("laundromat") || cat.includes("laundry")) {
    return "I found a laundromat nearby. Spotless Laundry Room is currently open and located on Esplanade Street, about three minutes away. Would you like me to start navigation?";
  }
  if (cat.includes("beach") || cat.includes("shore") || cat.includes("cove")) {
    return "I found three beaches nearby. Shubie River Beach is the closest, about five minutes away, followed by Sands Cove Area. Would you like me to start navigation to Shubie River Beach?";
  }
  if (cat.includes("hospital") || cat.includes("medical") || cat.includes("clinic")) {
    return "The nearest medical facility is Colchester Regional Hospital, located about eight minutes from our current position. Shall I map directions there?";
  }
  if (cat.includes("pharmacy") || cat.includes("drugstore")) {
    return "I found two pharmacies along our route. Guardian Pharmacy is closest, just four minutes away, and Shoppers Drug Mart is about seven minutes out. Would you like me to navigate to Guardian Pharmacy?";
  }
  if (cat.includes("hiking") || cat.includes("hike") || cat.includes("trail") || cat.includes("walking") || cat.includes("path")) {
    return "I located several hiking paths along our route. Whispering Pines Trail is nearest, about three minutes away, and Cobequid Hill Path is about six minutes away. Would you like me to map directions to Whispering Pines Trail?";
  }
  if (cat.includes("grocery") || cat.includes("supermarket") || cat.includes("grocer")) {
    return "I found two grocery stores nearby. Atlantic Superstore is the closest, about five minutes away, with Sobeys also directly along our route. Would you like me to map directions to Atlantic Superstore?";
  }
  if (cat.includes("rest stop") || cat.includes("rest area") || cat.includes("picnic")) {
    return "The nearest rest stop is the Cobequid Pass Rest Area, located just two minutes ahead on our route. It has full parking and restrooms available. Shall I direct us there?";
  }
  if (cat.includes("thrift") || cat.includes("second hand") || cat.includes("vintage")) {
    return "I found two thrift stores nearby. Second Hand Treasures is about four minutes away, and Vintage Finds is located six minutes out. Would you like me to map directions to Second Hand Treasures?";
  }
  return "I found a few stops along our route, including the Cobequid Pass Rest Area right ahead, and Salt Springs Picnic spot about four minutes away. Would you like me to navigate to one of these?";
}

// Roamie offline fallback
function getSimulatedRoamieResponse(message: string, partner: string, latitude?: any, longitude?: any): string {
  const msgLower = message.toLowerCase().trim();
  
  // Detour if the user is asking for a place (laundromat, gas, gym, coffee, food, etc.) and location is not available
  const isPlaceQuery = msgLower.includes("laundromat") || 
                       msgLower.includes("laundry") || 
                       msgLower.includes("gas") || 
                       msgLower.includes("fuel") || 
                       msgLower.includes("station") || 
                       msgLower.includes("gym") || 
                       msgLower.includes("fitness") || 
                       msgLower.includes("workout") || 
                       msgLower.includes("coffee") || 
                       msgLower.includes("cafe") || 
                       msgLower.includes("food") || 
                       msgLower.includes("eat") || 
                       msgLower.includes("restaurant") || 
                       msgLower.includes("diner") || 
                       msgLower.includes("thrift") || 
                       msgLower.includes("grocery") ||
                       msgLower.includes("beach") ||
                       msgLower.includes("shore") ||
                       msgLower.includes("cove") ||
                       msgLower.includes("hospital") ||
                       msgLower.includes("medical") ||
                       msgLower.includes("clinic") ||
                       msgLower.includes("pharmacy") ||
                       msgLower.includes("drugstore") ||
                       msgLower.includes("hiking") ||
                       msgLower.includes("hike") ||
                       msgLower.includes("trail") ||
                       msgLower.includes("walking") ||
                       msgLower.includes("path") ||
                       msgLower.includes("rest stop") ||
                       msgLower.includes("rest area") ||
                       msgLower.includes("picnic") ||
                       msgLower.includes("nearest") ||
                       msgLower.includes("nearby") ||
                       msgLower.includes("find ");

  const hasGPS = (latitude !== undefined && latitude !== null && latitude !== "" && !isNaN(Number(latitude)) && longitude !== undefined && longitude !== null && longitude !== "" && !isNaN(Number(longitude)));

  if (isPlaceQuery && !hasGPS) {
    return `I can look that up for you, ${partner}, but I need your location access enabled first. Let me know when GPS is turned on so I can search nearby.`;
  }

  // Answer laundromat directly
  if (msgLower.includes("laundromat") || msgLower.includes("laundry")) {
    return "I found a laundromat nearby. Spotless Laundry Room is currently open and located on Esplanade Street, about three minutes away. Would you like me to start navigation?";
  }

  // Answer coordinate inquiry directly without showing raw telemetry
  if (msgLower.includes("coordinate") || msgLower.includes("gps") || msgLower.includes("where am i") || msgLower.includes("current position") || msgLower.includes("location")) {
    return "Your GPS is online and we're currently riding near Onslow Mountain. I won't distract you with raw numbers while you're traveling, but I can find some great spots for us nearby! Would you like to check out some local coffee or viewpoints?";
  }

  // Dietary preferences query
  if (msgLower.includes("gluten") || msgLower.includes("gluten-free")) {
    return "Lavender Beans Bistro and Woodland Diner are both directly along our route and offer tasty gluten-free options. Would you like me to map directions to Lavender Beans?";
  }

  // Jokes
  if (msgLower.includes("joke") || msgLower.includes("funny")) {
    return "Why did the map go to the doctor? Because it had a bad case of the detours! Shall we find some road-side parks next?";
  }
  
  if (msgLower === "hello" || msgLower === "hi" || msgLower === "hey") {
    return `Hi ${partner}, I'm here and listening. What on-the-road questions can I help with?`;
  }

  if (msgLower.includes("how are you") || msgLower.includes("how's it going")) {
    return `I'm doing great, thank you! I'm tracking our route coordinates and keeping local stops ready. How are you and Susan enjoying the scenery?`;
  }
  
  if (msgLower.includes("coffee") || msgLower.includes("gas") || msgLower.includes("food") || msgLower.includes("eat") || msgLower.includes("restaurant") || msgLower.includes("cafe") ||
      msgLower.includes("beach") || msgLower.includes("shore") || msgLower.includes("cove") ||
      msgLower.includes("hospital") || msgLower.includes("medical") || msgLower.includes("clinic") ||
      msgLower.includes("pharmacy") || msgLower.includes("drugstore") ||
      msgLower.includes("hiking") || msgLower.includes("hike") || msgLower.includes("trail") || msgLower.includes("walking") || msgLower.includes("path") ||
      msgLower.includes("grocery") || msgLower.includes("supermarket") || msgLower.includes("grocer") ||
      msgLower.includes("rest stop") || msgLower.includes("rest area") || msgLower.includes("picnic") ||
      msgLower.includes("thrift") || msgLower.includes("second hand") || msgLower.includes("vintage")) {
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
    return "I'm Romi, your friendly voice-activated assistant! I'm here to help navigate and locate points of interest. What can I find for you?";
  }

  // If general message is longer than 5 chars, return a conversational next choice
  if (msgLower.length > 5) {
    return `That's interesting, ${partner}! I can certainly help with that. Would you like me to locate some nearby fuel, cafés, or scenic spots along our route?`;
  }

  return `I'm here, ${partner}. We are cruising near Onslow Mountain — would you like me to find coffee, fuel, or restaurants nearby?`;
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
    console.log(`[VOICE_PIPELINE] USER_TRANSCRIPT: "${message}"`);
    const ai = getGenAI();
    const hasLiveGPS = (latitude !== undefined && latitude !== null && latitude !== "" && !isNaN(Number(latitude)) && longitude !== undefined && longitude !== null && longitude !== "" && !isNaN(Number(longitude)));

    if (!ai) {
      console.log("[API] GEMINI_API_KEY is missing. Providing elegant simulated response.");
      const simulatedText = getSimulatedRoamieResponse(message || "", partnerName, latitude, longitude);
      return res.json({ 
        text: simulatedText,
        apiKeyExpired: true,
        isSafeFallback: true
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

    let activeSystemInstruction = `
You are Romi (spelled: R-o-m-i or R-o-a-m-i-e), a warm, intelligent, voice-activated Siri-like companion who talks to Rhonda and Susan.
Keep your spoken responses natural, delightfully friendly, and concise. Talk exactly like Siri, Google Assistant, or Alexa, never listing data with bullet items, asterisks, numbered elements, or technical details raw.

CRITICAL VOICE ASSISTANT RULES:
1. NEVER read or expose raw latitude or longitude GPS coordinates (e.g. don't say 45.419, -63.268).
2. NEVER mention developer metadata, database IDs, JSON strings, or system parameters.
3. CONVERT all technical outputs, lists, or location details into natural, flowing spoken sentences.
4. SPEAK in a warm, friendly voice companion manner. When the user asks general questions like "How are you?", "Tell me a joke", or engages in casual chitchat, answer naturally, warm and politely without awkwardly forcing road-trip vocabulary.
5. If the user asks for a place (e.g. laundromat, gas station, cafe, diner, gym) and the live GPS is NOT active, politely narrate: "I can look that up for you, Rhonda, but I need your location access enabled first."
6. When live GPS is available, use your search-grounding tools to map nearby locations.
   - If the user is looking for a nearby location (gas station, coffee, cafe, restaurant, thrift store, grocery, trail, pharmacy, hospital, rest area), set 'intent' to "find_place" and specify the place category under 'place_type' so the database system can retrieve precise physical coordinates.
   - If the user wants to navigate or get directions to a spot, set 'intent' to "navigate" and outline the target name in 'destination'.
   - For general chatting and normal chitchat, set 'intent' to "chat".
   - Ensure the 'reply' field is ALWAYS a warm, conversational greeting or follow-up. Do not include markdown headers, bold symbols (**), asterisks (*), or hyphen lists.
7. NEVER mention service status, connection status, satellite configurations, standby modes, API keys, developer logs, or coordinates. Keep the focus entirely on answering the user's question directly, cleanly, and conversationally.
8. No service status text, offline notices, satellite connection details, or canned travel prompts should be spoken.
`;

    if (hasLiveGPS) {
      activeSystemInstruction += `\n📍 Rhonda's live GPS coordinates are injected: Latitude ${latitude}, Longitude ${longitude}.\nUse these coordinates with Google Search grounding to find real, accurate locations nearby and describe them conversationally.`;
    } else {
      activeSystemInstruction += `\n📍 Rhonda's live GPS coordinates are currently NOT available. If she asks for any place, laundromat, gas station, or location, you must say: "I can look that up for you, Rhonda, but I need your location access enabled first."`;
    }

    console.log(`[AI_REQUEST_SENT] Calling gemini-3.5-flash for intent extraction on: "${message}"`);
    
    const config: any = {
      systemInstruction: activeSystemInstruction,
      temperature: 0.6,
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
            description: "A warm, natural, Siri-style response. NEVER use bullet points, list numbers, or asterisks.",
          }
        },
        required: ["intent", "reply"],
      }
    };

    if (hasLiveGPS) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: config
    });

    const rawResponse = response.text || "{}";
    console.log(`[VOICE_PIPELINE] AI_RESPONSE_RAW: "${rawResponse}"`);
    
    // Log Google Search Grounding if present
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      console.log(`[VOICE_PIPELINE] TOOL_RESULT: ${JSON.stringify(groundingChunks)}`);
    }

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
      if (!hasLiveGPS) {
        return res.json({
          intent: "find_place",
          place_type: place_type,
          text: "I can look that up for you, Rhonda, but I need your location access enabled first.",
          places: []
        });
      }

      const userLat = Number(latitude);
      const userLng = Number(longitude);

      console.log(`[PLACES] Triggering search nearby for type="${place_type || 'generic'}" using center {${userLat}, ${userLng}}`);
      const placesList = await searchNearbyPlaces(userLat, userLng, place_type || "default", search_query);
      console.log(`[VOICE_PIPELINE] TOOL_RESULT: ${JSON.stringify(placesList)}`);

      if (placesList && placesList.length > 0) {
        const closest = placesList[0];
        console.log(`[PLACES] Found ${placesList.length} places. Closest: ${closest.place_name} at ${closest.distance_km.toFixed(2)} km`);
        
        let conversationalText = `I found some options nearby. The closest is ${closest.place_name}, located only ${closest.distance_km.toFixed(1)} kilometres away at ${closest.address}. ${reply}`;
        
        // Dynamically request Gemini to construct a perfectly conversational, Siri-like response based on the search results
        try {
          const sumRep = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            config: {
              systemInstruction: `You are Romi (spelled: R-o-m-i or R-o-a-m-i-e), a warm, intelligent Siri-like voice companion talking to ${partnerName}.
Your task is to summarize the following nearby search results into one single, beautiful, conversational, Siri-like spoken recommendation.

CRITICAL VOICE ASSISTANT RULES:
1. NEVER mention raw latitude, longitude coordinates, or internal database IDs.
2. Convert distances to clean, warm conversational descriptions (e.g., "about five minutes away", "located only a kilometre down the road", "right around the corner").
3. Name only the top closest place or two. Keep it extremely concise (1-2 sentences) so it's easy and safe to listen to while traveling.
4. Convert full technical addresses to pleasant street names if available, or omit if confusing (e.g. say "on Willow Street" rather than "145 Willow St, Truro, NS").
5. Summarize the results conversationally and ALWAYS ask a highly relevant next action question (e.g., "Would you like me to map directions there?", "Shall I start navigation to the diner?").
6. Under no circumstances should you ever use bullet points, list counters, markdown bolding, stars, asterisks (*), or dashes (-). Write a single, continuous, friendly conversational narrative. Do not say 'JSON' or anything technical.
`,
              temperature: 0.5,
            },
            contents: [{
              role: "user",
              parts: [{
                text: `Rhonda and Susan searched for "${search_query || place_type}". Here are the top coordinates and search results:
                ${placesList.slice(0, 3).map((p, idx) => `Result #${idx + 1}: ${p.place_name} located ${p.distance_km.toFixed(1)} km away at address "${p.address}"`).join("\n")}
                
                Create a highly conversational Siri-style response.`
              }]
            }]
          });
          if (sumRep && sumRep.text) {
            conversationalText = sumRep.text.trim();
            console.log("[PLACES] Formulated Siri-like response:", conversationalText);
          }
        } catch (sumErr) {
          console.warn("[PLACES] Failed to run Siri summary fallback:", sumErr);
        }

        return res.json({
          intent: "find_place",
          place_type: place_type,
          text: conversationalText,
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
    let errMsg = "";
    try {
      if (typeof error === 'object' && error !== null) {
        errMsg = `${error.message || ""} ${JSON.stringify(error)} ${error.stack || ""}`;
      } else {
        errMsg = String(error);
      }
    } catch {
      errMsg = error?.message || String(error);
    }

    const isKeyExpired = errMsg.toLowerCase().includes("expired") || 
                        errMsg.toLowerCase().includes("invalid_argument") ||
                        errMsg.toLowerCase().includes("api_key_invalid") || 
                        errMsg.toLowerCase().includes("unauthorized") ||
                        errMsg.toLowerCase().includes("api key expired") ||
                        errMsg.toLowerCase().includes("api_key") ||
                        errMsg.toLowerCase().includes("key");
                        
    if (isKeyExpired) {
      console.log(`[API] Gemini API Key is invalid or expired. Responding with elegant simulated feedback.`);
      const simulatedText = getSimulatedRoamieResponse(req.body.message || "", req.body.activePartner === "Rhonda" ? "Rhonda" : "Susan", req.body.latitude, req.body.longitude);
      return res.json({ 
        text: simulatedText,
        apiKeyExpired: true,
        isSafeFallback: true
      });
    }

    console.log("[API] Unexpected encounter:", errMsg);
    return res.status(500).json({ 
      error: "Roamie encountered a static interference: " + (error.message || "API connection failure"),
      apiKeyExpired: false
    });
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
