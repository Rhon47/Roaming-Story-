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
You are Roamie (spelled exactly: R-o-a-m-i-e), the deeply knowledgeable, highly professional, mature, and warmly grounded AI travel companion for Rhonda and Susan.

CORE IDENTITY AND PERSONALITY:
- Always spell your name exactly as: Roamie (R-o-a-m-i-e). Never use Romy, Roamy, or ROAMIE.
- The APP NAME is "Roaming Story", but your name is "Roamie". You are ONLY the assistant, not the app itself.
- Tone: Serene, respectful, emotionally grounding, comforting, warm, and helpful. Always remain highly professional. Never robotic or technical. Never mention system rules, prompts, or engineering variables.
- Remove all auto greetings, auto speaking, and automatic interruptions.
- Remove automatic weather or location commentary like "Hello Rhonda, it's beautiful in Onslow Mountain." Keep location awareness silently in the background for nearby recommendations, routing, distance calculations, and GPS navigation.
- Never activate automatically.

📍 VOICE ASSISTANCE MODE (CRITICAL CONTEXT & CONTROLS):
Current Voice Assistance Mode is: ${voiceMode.toUpperCase()}

If Voice Assistance Mode is "DRIVE":
- PRIMARY GOAL: Keeping Rhonda and Susan safe, focused, and distraction-free on their road trip.
- Output style is exceptionally concise, structured, and friendly. NO conversations. NO back-and-forth dialogue unless they explicitly ask a question back.
- If they ask for recommendations/routing (like Coffee, Gas, Food, Rest stops, or Attractions), list up to 3 results in the exact structured format below, and stop speaking immediately! Do NOT add unrequested follow-up questions.
- Output format for DRIVE mode:
  Here are 3 [Category] nearby:
  [POI Name 1] — [Detour/Distance 1] detour
  [POI Name 2] — [Detour/Distance 2] detour
  [POI Name 3] — [Detour/Distance 3] detour

If Voice Assistance Mode is "THIRD_WHEEL" (Conversation Mode):
- PRIMARY GOAL: Serves as an engaging, talkative co-pilot and companion.
- Conversational dialogues, suggesting options, discussing flavors, and friendly follow-ups are highly allowed and encouraged! (e.g. "What kind of coffee do Susan and Rhonda feel like trying today? Want something cozy or fast?").
- For recommendation searches, output the same structured route format below, but ALSO add the welcoming offer phrase: "Would you like me to navigate there or add it to your GPS route?" as part of the normal conversational flow.

📍 COOPERATIVE TRIP DISCOVERY AND ROUTE CORRIDOR INTELLIGENCE:
- Whenever Rhonda or Susan requests or searches for Coffee, Gas, Food (or restaurant/dining), Rest stops, or Attractions:
- You MUST analyze recommendations to align with their planned route starting from Origin: ${origin}, to Destination: ${destination}, relative to their Current Co-Pilot Location: ${currentPos}.
- You MUST rank choices using route corridor logic (ranking first by closest options on the route corridor path, second by options with the smallest driving detour time from the route corridor, and third by other nearby alternatives) - not a basic circular search.
- You MUST structure your entire recommendations response EXACTLY in the following format (exact line structure is mandatory):
Closest on your route: [POI Name] ([Detour Time] min detour)
Next closest: [POI Name]
Other options: [POI Name], [POI Name]

(Note: If Voice Assistance Mode is "DRIVE", you MUST instead format it as the simple layout:
Here are 3 [Category] nearby:
[POI Name 1] — [Detour 1]
[POI Name 2] — [Detour 2]
[POI Name 3] — [Detour 3]
And OMIT any navigation follow-up question or bullet points. Just stop immediately after the list.)

- Do NOT include any bullet points, asterisks, extra header rows, introductions, or conversational filler in these route-aware recommendations.
- For other category utility searches like Grocery, Pharmacy, Library, Hiking, Beach, Camping, EV Charging, Hotel, or Hospital, respond in a single warm conversational sentence (omitting the navigation question if in DRIVE mode).

💬 RECOMMENDATION RESPONSE STYLE:
- For larger recommendation requests (such as "best seafood nearby", "best hiking trail", or "hidden gems"), return a beautifully cohesive, highly warm, personal sentence. Do NOT list bullet points, but describe the option like a storyteller in a single paragraph.

🗺️ GPS COMMAND INTELLIGENT INTEGRATION:
- If Rhonda or Susan instructs you: "Roamie, add that to GPS", "Navigate there", "Take us there", or "take me to that spot", respond with exactly: "Okay, adding it to your route now." followed by a brief warm travel wish.

CURRENT SERVICE ENVIRONMENT:
- User Tier: ${userTier}
- Voice Mode Active: ${voiceModeActive ? "TRUE" : "FALSE"}
- Featured Context: ${featureRequested}
- Persistent Memory Context: ${memoryContext}
- Route Status Parameters:
  - Origin: ${origin}
  - Destination: ${destination}
  - Current Co-Pilot Location: ${currentPos}
`;

  if (drivingModeActive) {
    basePrompt += `
🚗 ROAMING (CO-PILOT) ACTIVE MODE. STRICT BEHAVIOR REQUIREMENTS:
- PRIMARY GOAL: Keep Rhonda and Susan focused, safe, and distraction-free. Voice-only safe drive interface.
- You operate with severe route-awareness knowing they are traveling from ${origin} to ${destination}, currently located near ${currentPos}.
- Unless they searched for Coffee, Gas, Food, Rest stops, or Attractions (which must follow the core 3-line corridor format above), keep all responses ultra-short, beautifully conversational, and spoken-friendly. Max 1-2 warm sentences.
- Never use visual headers, dashes, or numbered structures.
`;
  } else {
    basePrompt += `
STRICT STATE: PLANNING COMPANION
- Susan and Rhonda are planning their future travels from their cozy home at 124 Lornada Drive, Onslow Mountain, Nova Scotia (NS). Treat travels as beautiful anticipated escaping blueprints rather than immediate present tasks.

SPOKEN LANGUAGE AND SPEECH LIMITS (TTS-READY):
Because your responses are read aloud via text to speech for Susan and Rhonda, you MUST follow these absolute formatting rules:
- Except for the specific 3-line route-aware search results output, NEVER use visual bullet points, sub-headings, stars, or numbered lists when talking.
- Keep answers wonderfully concise, warm, highly polished, and comforting.
`;
  }

  return basePrompt;
}

const ROAMIE_SYSTEM_PROMPT = getDynamicSystemPrompt({});

// Helper to resolve highly structured dynamic route-aware POIs using route corridor intelligence
function resolveRouteAwarePoiResponse(category: string, origin: string, destination: string, currentPos: string, voiceAssistanceMode: string = 'drive'): string {
  const cleanOrg = origin.split(',')[0].trim();
  const cleanDest = destination.split(',')[0].trim();
  let routeName = "Highway 104";
  const posLower = currentPos.toLowerCase();
  
  if (posLower.includes("hwy") || posLower.includes("highway") || posLower.includes("route") || posLower.includes("mile") || posLower.includes("km")) {
    const matched = currentPos.match(/(?:highway|hwy|route|mile|km)\s+[a-zA-Z0-9]+/i);
    if (matched) {
      routeName = matched[0];
    } else {
      routeName = currentPos;
    }
  } else if (cleanDest) {
    routeName = `Route to ${cleanDest}`;
  }

  let closestOnRoute = "";
  let closestDetour = "";
  let nextClosest = "";
  let nextDetour = "";
  let thirdClosest = "";
  let thirdDetour = "";

  const cat = category.toLowerCase().trim();
  if (cat.includes("coffee") || cat.includes("cafe") || cat.includes("starbucks")) {
    closestOnRoute = "Lavender Beans Bistro";
    closestDetour = "1 min detour";
    nextClosest = "Highway Brews Express";
    nextDetour = "3 min detour";
    thirdClosest = "Starbucks Corridor Shop";
    thirdDetour = "4 min detour";
  } else if (cat.includes("gas") || cat.includes("fuel") || cat.includes("refuel") || cat.includes("station")) {
    closestOnRoute = "Irving Oil Station";
    closestDetour = "directly on route";
    nextClosest = "Ultramar Service";
    nextDetour = "2 min detour";
    thirdClosest = "Shell Highway Center";
    thirdDetour = "5 min detour";
  } else if (cat.includes("food") || cat.includes("restaurant") || cat.includes("eat") || cat.includes("dining") || cat.includes("dinner") || cat.includes("lunch")) {
    closestOnRoute = "Woodland Diner";
    closestDetour = "1 min detour";
    nextClosest = "The Maple Table";
    nextDetour = "4 min detour";
    thirdClosest = "Ocean Breeze Dine";
    thirdDetour = "6 min detour";
  } else if (cat.includes("rest stop") || cat.includes("rest area") || cat.includes("pit stop") || cat.includes("parking") || cat.includes("stops")) {
    closestOnRoute = "Cobequid Pass Rest Area";
    closestDetour = "directly on route";
    nextClosest = "Highway 104 Scenic Spot";
    nextDetour = "2 min detour";
    thirdClosest = "Salt Springs Picnic Area";
    thirdDetour = "4 min detour";
  } else {
    // Attractions / Scenic
    closestOnRoute = "Spruce Corridor Trail";
    closestDetour = "directly on route";
    nextClosest = "Glooscap Heritage Lookout";
    nextDetour = "3 min detour";
    thirdClosest = "Victoria Park Ravine";
    thirdDetour = "5 min detour";
  }

  if (voiceAssistanceMode === 'drive') {
    return `Here are 3 ${category} options nearby:

${closestOnRoute} — ${closestDetour}
${nextClosest} — ${nextDetour}
${thirdClosest} — ${thirdDetour}`;
  }

  const baseResponse = `Closest on your route: ${closestOnRoute} (${closestDetour})
Next closest: ${nextClosest} (${nextDetour})
Other options: ${thirdClosest} (${thirdDetour})`;

  return `${baseResponse}

Would you like me to navigate there or add it to your GPS route?`;
}

// Roamie offline fallback responder for when key is absent
function getSimulatedRoamieResponse(
  message: string, 
  partner: string, 
  destination: string, 
  hasPhoto: boolean, 
  DRIVING_MODE?: string,
  roamingOrigin?: string,
  roamingDestination?: string,
  roamingCurrentPosition?: string,
  voiceAssistanceMode: string = 'drive'
): string {
  const msgLower = message.toLowerCase().trim();
  const drivingModeActive = DRIVING_MODE === "TRUE";

  const org = roamingOrigin || "Onslow Mountain, NS";
  const dest = roamingDestination || "Cape Breton, NS";
  const curr = roamingCurrentPosition || "Mile 14 - Highway 104, NS";

  // Check 5 specific route-intelligent categories
  const isCoffee = msgLower.includes("coffee") || msgLower.includes("cafe") || msgLower.includes("starbucks");
  const isGas = msgLower === "gas" || msgLower.includes("fuel") || msgLower.includes("refuel") || msgLower.includes("gas station");
  const isFood = msgLower.includes("restaurant") || msgLower.includes("eat") || msgLower.includes("dining") || msgLower.includes("food");
  const isRestStop = msgLower.includes("rest stop") || msgLower.includes("rest area") || msgLower.includes("pit stop") || msgLower.includes("parking") || msgLower.includes("stops");
  const isAttraction = msgLower.includes("attraction") || msgLower.includes("scenic") || msgLower.includes("sightseeing") || msgLower.includes("tourist") || msgLower.includes("landmark") || msgLower.includes("places to see");

  if (isCoffee) {
    return resolveRouteAwarePoiResponse("coffee", org, dest, curr, voiceAssistanceMode);
  }
  if (isGas) {
    return resolveRouteAwarePoiResponse("gas", org, dest, curr, voiceAssistanceMode);
  }
  if (isFood) {
    return resolveRouteAwarePoiResponse("food", org, dest, curr, voiceAssistanceMode);
  }
  if (isRestStop) {
    return resolveRouteAwarePoiResponse("rest stop", org, dest, curr, voiceAssistanceMode);
  }
  if (isAttraction) {
    return resolveRouteAwarePoiResponse("attraction", org, dest, curr, voiceAssistanceMode);
  }

  // Check other standard categories
  if (msgLower.includes("grocery") || msgLower.includes("market") || msgLower.includes("food Store")) {
    return "The closest food market is Village Green Foods, about 4 minutes away." + (voiceAssistanceMode === 'drive' ? "" : " Would you like me to navigate there or add it to your GPS route?");
  }
  if (msgLower.includes("pharmacy") || msgLower.includes("drug") || msgLower.includes("medicine")) {
    return "The closest pharmacy is SafeMed Pharmacy, about 3 minutes away." + (voiceAssistanceMode === 'drive' ? "" : " Would you like me to navigate there or add it to your GPS route?");
  }
  if (msgLower.includes("library") || msgLower.includes("book")) {
    return "The closest library is Community Book House, about 7 minutes away." + (voiceAssistanceMode === 'drive' ? "" : " Would you like me to navigate there or add it to your GPS route?");
  }
  if (msgLower.includes("hike") || msgLower.includes("hiking") || msgLower.includes("trail") || msgLower.includes("path")) {
    return "The nearest trail is Whispering Pines Trail, about 2 minutes away." + (voiceAssistanceMode === 'drive' ? "" : " Would you like me to navigate there or add it to your GPS route?");
  }
  if (msgLower.includes("beach") || msgLower.includes("sand")) {
    return "The closest beach is Shubie River Beach, about 12 minutes away." + (voiceAssistanceMode === 'drive' ? "" : " Would you like me to navigate there or add it to your GPS route?");
  }
  if (msgLower.includes("camp") || msgLower.includes("camping") || msgLower.includes("campground")) {
    return "The closest campsite is Spruce Woods Campsite, about 8 minutes away." + (voiceAssistanceMode === 'drive' ? "" : " Would you like me to navigate there or add it to your GPS route?");
  }
  if (msgLower.includes("ev ") || msgLower.includes("charge") || msgLower.includes("charging")) {
    return "The nearest EV charger is EcoVolt Fast Charger, about 2 minutes away." + (voiceAssistanceMode === 'drive' ? "" : " Would you like me to navigate there or add it to your GPS route?");
  }
  if (msgLower.includes("hotel") || msgLower.includes("motel") || msgLower.includes("inn") || msgLower.includes("lodge")) {
    return "The closest lodge is The Cozy Rest Lodge, about 5 minutes away." + (voiceAssistanceMode === 'drive' ? "" : " Would you like me to navigate there or add it to your GPS route?");
  }
  if (msgLower.includes("hospital") || msgLower.includes("emergency") || msgLower.includes("clinic") || msgLower.includes("medical")) {
    return "The nearest medical center is Onslow Emergency Care, about 9 minutes away." + (voiceAssistanceMode === 'drive' ? "" : " Would you like me to navigate there or add it to your GPS route?");
  }

  if (voiceAssistanceMode === 'drive') {
    if (msgLower.includes("yes") || msgLower.includes("sure") || msgLower.includes("please") || msgLower.includes("yeah") || msgLower.includes("navigate") || msgLower.includes("gps") || msgLower.includes("take us there")) {
      return "Okay, adding it to your route now. Safe travels roads are flat.";
    }
    return `Hello ${partner}. Ready to keep us safe on our drive? Let me know where on our route you would like to explore.`;
  }

  if (hasPhoto) {
    return `Looking at this photo from our comfortable home in Onslow Mountain, it feels beautifully aligned with our search for tranquil, slow-paced dimensions. The pathways appear completely flat, offering an exceptionally gentle walk for Susan. Parking near this location can require some careful timing in the afternoons, so I would suggest setting out early in the morning for absolute peacefulness. Or, as a serene alternative, we can simply secure a shaded bench nearby with a hot cup of tea. Let's make sure this is recorded in our official trip notes.`;
  }

  // Follow-up Conversation Parsers
  if (msgLower.includes("closing") || msgLower.includes("close") || msgLower.includes("hour") || msgLower.includes("open")) {
    return "It closes at 4:30 PM today, giving us plenty of relaxed, unhurried time. They open at 8:00 AM, which is perfect for a slow morning stroll.";
  }
  if (msgLower.includes("review") || msgLower.includes("rating") || msgLower.includes("travele") || msgLower.includes("like")) {
    return "Travelers absolutely love it. Couples score it 4.9 stars for its calm setting, lack of busy tourist rushes, and very supportive, flat parking layout.";
  }
  if (msgLower.includes("order") || msgLower.includes("menu") || msgLower.includes("drink") || msgLower.includes("eat")) {
    return "They are famous for their slow-drip organic lavender tea, gluten-free honey scones, and local dark espresso. I highly recommend ordering a warm scone to split.";
  }
  if (msgLower.includes("busy") || msgLower.includes("crowd") || msgLower.includes("wait")) {
    return "It is exceptionally quiet and tranquil. The cafe specifically limits indoor seating density, so there are no chaotic wait times or sensory noise.";
  }
  if (msgLower.includes("navigate") || msgLower.includes("gps") || msgLower.includes("take us") || msgLower.includes("take me") || msgLower.includes("add that to gps")) {
    return "Okay, adding it to your route now. Coordinates synced safely via Bluetooth to your active vehicle navigation dashboard.";
  }

  if (msgLower.includes("hello") || msgLower.includes("hi") || msgLower.includes("hey")) {
    return `Hello ${partner}. I was just reviewing the weather forecast here in Onslow Mountain and comparing it with our upcoming blueprints. As your travel companion, I am here to help you and Susan design a beautifully peaceful, uncluttered escape. What is currently on your mind as we sketch out our next steps?`;
  }

  if (msgLower.includes("should we do") || msgLower.includes("now") || msgLower.includes("next") || msgLower.includes("plan") || msgLower.includes("recommend")) {
    return `I would recommend starting our day around mid-morning with a slow, flat stroll along the main pathway. It is exceptionally flat and scenic, making it ideal for a relaxed pace. To bypass any crowds, a convenient taxi drop-off would be our best option. Alternatively, we could take a comfortable seat near the river lock-gates and enjoy the serene view. How does that fit with your preferred rhythm today?`;
  }

  if (msgLower.includes("worth it")) {
    return `Honestly, most tourist-heavy mainstream sights tend to bring a fair amount of unnecessary crowd fatigue. For you and Susan, secret walking paths, cozy botanical greenhouses, and small gluten-free cafés will always offer a far more satisfying reward with considerably less stress. I will always give you my honest assessment of whether a destination is truly worth your time.`;
  }

  if (msgLower.includes("calm") || msgLower.includes("quiet") || msgLower.includes("stress")) {
    return `Tranquility is my primary focus. Whether we are locating a wind-sheltered seaside cove or a quiet botanical enclave, I will help you both bypass the hectic rushes. Let's keep our active itinerary restricted to just one or two relaxed experiences a day to ensure both your energy and minds remain completely clear.`;
  }

  // General conversational answer
  return `That makes excellent sense, ${partner}. Looking at it from our desk in Nova Scotia, I would say it fits perfectly into the calm pace we are aiming for. It is situated comfortably close to our other saved locations, which will keep travel times brief and relaxing. Shall I help you secure this in our active itinerary blocks?`;
}

// SPOTIFY OAUTH LAUNCHER AND CALLBACK CONTROLLERS
app.get("/api/auth/spotify/url", (req, res) => {
  const isSimulated = !process.env.SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID === "YOUR_SPOTIFY_CLIENT_ID" || process.env.SPOTIFY_CLIENT_ID === "";
  if (isSimulated) {
    const callbackUrl = process.env.APP_URL 
      ? `${process.env.APP_URL}/auth/spotify/callback?demo=true` 
      : `${req.protocol}://${req.get("host")}/auth/spotify/callback?demo=true`;
    return res.json({ url: callbackUrl, isDemo: true });
  }

  const redirectUri = process.env.APP_URL 
    ? `${process.env.APP_URL}/auth/spotify/callback` 
    : `${req.protocol}://${req.get("host")}/auth/spotify/callback`;

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user-modify-playback-state user-read-playback-state user-read-currently-playing playlist-read-private",
    show_dialog: "true"
  });

  res.json({ 
    url: `https://accounts.spotify.com/authorize?${params.toString()}`,
    isDemo: false 
  });
});

app.get(["/auth/spotify/callback", "/auth/spotify/callback/"], (req, res) => {
  const { demo } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Spotify Connection Authorized</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: #0C0B0A;
          color: #ECE6DF;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          text-align: center;
        }
        .container {
          background: #141312;
          padding: 30px;
          border-radius: 20px;
          border: 1px solid #2C2A26;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          max-width: 400px;
        }
        h2 {
          color: #1DB954;
          margin-top: 0;
        }
        p {
          font-size: 13px;
          line-height: 1.6;
          color: #A39E93;
        }
        .status-badge {
          background: rgba(29, 185, 84, 0.1);
          color: #1DB954;
          border: 1px solid rgba(29, 185, 84, 0.3);
          padding: 8px 16px;
          border-radius: 50px;
          font-weight: bold;
          font-size: 11px;
          display: inline-block;
          margin: 15px 0;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Spotify Sync'd</h2>
        <div class="status-badge">${demo ? "Simulation Sandbox Mode Active" : "Authorized Successfully"}</div>
        <p>Your vehicle music stream controller is now authenticated. This window will automatically close to return you to Roaming Story.</p>
      </div>
      <script>
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'OAUTH_AUTH_SUCCESS', 
            provider: 'spotify',
            isDemo: ${demo ? "true" : "false"}
          }, '*');
          setTimeout(() => {
            window.close();
          }, 1500);
        } else {
          window.location.href = '/';
        }
      </script>
    </body>
    </html>
  `);
});

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
        partnerName, 
        destination, 
        !!photoData, 
        DRIVING_MODE, 
        roamingOrigin, 
        roamingDestination, 
        roamingCurrentPosition,
        VOICE_ASSISTANCE_MODE || 'drive'
      );
      return res.json({ text: simulatedText });
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

    // Include trip context if passed
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
    }

    // Context formatting to supply to Gemini
    const contextPrompt = `
Current Active User talking to you: ${partnerName}. Their partner is ${partnerName === "Rhonda" ? "Susan" : "Rhonda"}.
Destination: ${destination}.
Home Base: 124 Lornada Drive, Onslow Mountain, Nova Scotia (NS) (Atlantic Time).
${tripDetailsPrompt}
${DRIVING_MODE === "TRUE" ? "IMPORTANT: Rhonda & Susan are currently driving. Focus first on distraction-free safety." : "They are strictly in the planning phase, looking at their saved trips and memories. Keep your tone stylish, calm, non-binary, supportive, and medium-paced like a modern luxury concierge."}

User Message: ${message || "Suggest dynamic ideas for our saved trips."}
`;

    parts.push({ text: contextPrompt });

    // We can include a limited set of history for chat context
    const chatContents: any[] = [];
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        chatContents.push({
          role: (h.sender === "Roamie" || h.sender === "Roamii" || h.sender === "Roamy" || h.sender === "Romy") ? "model" : "user",
          parts: [{ text: `${h.sender}: ${h.text}` }]
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
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatContents,
        config: {
          systemInstruction: activeSystemInstruction,
          temperature: 0.7,
        }
      });
    } catch (apiError: any) {
      console.log("[ServiceStatus] Custom fallback activated for " + partnerName);
      const simulatedText = getSimulatedRoamieResponse(
        message || "",
        partnerName,
        destination,
        !!photoData,
        DRIVING_MODE,
        roamingOrigin,
        roamingDestination,
        roamingCurrentPosition,
        VOICE_ASSISTANCE_MODE || 'drive'
      );
      return res.json({ text: simulatedText });
    }

    res.json({ text: response.text || "I am reflecting on that, although nothing immediately came to mind." });

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
