import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Trash2, 
  Upload, 
  Sparkles, 
  X, 
  Heart, 
  MessageSquare,
  Plus,
  FileText,
  Image,
  Check,
  AlertCircle,
  Mic,
  MicOff,
  ChevronRight,
  MapPin,
  Calendar,
  Lock,
  ArrowLeft,
  Settings as SettingsIcon,
  Compass,
  Car,
  Home,
  Save,
  Clock,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Bluetooth,
  Edit,
  RotateCcw,
  CheckCircle2,
  Camera,
  RefreshCw,
  Download,
  Share2,
  Mail,
  Radio,
  Navigation,
  Map,
  Search,
  Headphones,
  Smartphone,
  Link2,
  Coffee,
  Fuel,
  ShoppingBag,
  ShoppingCart,
  Utensils,
  Trees,
  Pill,
  Footprints,
  ParkingCircle,
  Hospital as HospitalIcon,
  Palmtree
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Trip, TripChat, ChatLogMessage, Activity, ItineraryDay, SavedIdea, TripPhoto, Traveler } from './types';
import { RoamieAvatar } from './components/RoamieAvatar';

// Persistent storage keys
const STORAGE_PREFIX = 'roamie_v3_';
const PROFILE_KEY = STORAGE_PREFIX + 'user_profile';
const TRIPS_KEY = STORAGE_PREFIX + 'trips';
const CHATS_KEY = STORAGE_PREFIX + 'chats';

// Safe unique ID generator for preview contexts
function generateId(): string {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ---- ULTRA-ROBUST INDEXEDDB STORAGE FOR LARGE BRANDING LOGOS & AVATARS ----
const dbName = 'roamie_branding_db';
const storeName = 'assets_store';

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function saveBrandingAsset(key: string, value: string): Promise<void> {
  return initDB().then(db => {
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }).catch(err => {
    console.warn("IndexedDB save failed, writing to fallback localStorage element:", err);
    try {
      localStorage.setItem('roamie_db_chunk_' + key, value);
    } catch (e) {
      console.error("All custom branding storage systems exceeded space quota limits:", e);
    }
  });
}

export function loadBrandingAsset(key: string): Promise<string | null> {
  return initDB().then(db => {
    return new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }).catch(err => {
    console.warn("IndexedDB load failed, attempting chunk fallback retrieval:", err);
    return Promise.resolve(localStorage.getItem('roamie_db_chunk_' + key));
  });
}

// ---- DRIVE MODE SOUNDTRACK Blueprints ----
const DRIVE_TRACKS = [
  {
    id: 'track-1',
    title: 'Nova Scotia Coastal Breeze',
    artist: 'Coastal Highway Acoustic',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '6:12',
    albumArt: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'track-2',
    title: 'Sunset Solitude Drive',
    artist: 'Ethereal Synths',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '7:05',
    albumArt: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'track-3',
    title: 'Gatineau Park Autumn Cruise',
    artist: 'Acoustic Guitar Folk',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: '5:44',
    albumArt: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=150&q=80'
  }
];

export default function App() {
  // ---- NATIVE VOICE NAVIGATION AND DEVICE REDIRECTION ENGINE ----
  const getCoordinatesForPlace = (placeName: string): { latitude: number; longitude: number } => {
    const nameLower = placeName.toLowerCase();
    
    // Custom dictionary for known places in Nova Scotia
    if (nameLower.includes('onslow')) {
      return { latitude: 45.419, longitude: -63.268 };
    } else if (nameLower.includes('coffee') || nameLower.includes('java') || nameLower.includes('just us')) {
      return { latitude: 45.367, longitude: -63.286 };
    } else if (nameLower.includes('gas') || nameLower.includes('station') || nameLower.includes('shell') || nameLower.includes('petro')) {
      return { latitude: 45.363, longitude: -63.295 };
    } else if (nameLower.includes('victoria park')) {
      return { latitude: 45.358, longitude: -63.272 };
    } else if (nameLower.includes('cape breton')) {
      return { latitude: 46.136, longitude: -60.970 };
    } else if (nameLower.includes('halifax')) {
      return { latitude: 44.648, longitude: -63.575 };
    } else if (nameLower.includes('peggy')) {
      return { latitude: 44.492, longitude: -63.917 };
    }
    
    // Fallback: Generate deterministic coordinates in Nova Scotia based on name string hash
    let hash = 0;
    for (let i = 0; i < placeName.length; i++) {
      hash = placeName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const latOffset = (Math.abs(hash % 100) / 1000) - 0.05;
    const lngOffset = (Math.abs((hash >> 8) % 100) / 1000) - 0.05;
    
    return {
      latitude: 45.364 + latOffset,
      longitude: -63.282 + lngOffset
    };
  };

  const launchDeviceNavigation = (label: string, query: string) => {
    setNavigationErrorTarget(null);
    const coords = getCoordinatesForPlace(label);
    const { latitude, longitude } = coords;
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    let targetUrl = `geo:0,0?q=${latitude},${longitude}`; // default geo for Android
    if (isIOS) {
      targetUrl = `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
    }
    
    console.log("[STT Navigation] Attempting to launch device maps URL:", targetUrl);
    
    let opened = false;
    const heartbeat = setTimeout(() => {
      if (!opened) {
        console.warn("[STT Navigation] Native app didn't blur page, showing fallback manual button");
        setNavigationErrorTarget({ label, query, latitude, longitude });
        // Speak the specific error text
        speakText("I found the destination, but I couldn't open your navigation app.");
        if (typeof fireAssistantEvent === 'function') {
          fireAssistantEvent('ERROR_NAVIGATION_FAILED');
        }
      }
    }, 2200);

    const onPageBlur = () => {
      opened = true;
      clearTimeout(heartbeat);
      console.log("[STT Navigation] Success blur callback fired");
      if (typeof fireAssistantEvent === 'function') {
        fireAssistantEvent('NAVIGATION_STARTED');
      }
    };

    window.addEventListener('blur', onPageBlur, { once: true });
    
    // Clean up event listener after timeout run anyway
    setTimeout(() => {
      window.removeEventListener('blur', onPageBlur);
    }, 5000);

    try {
      if (isIOS || isAndroid) {
        window.location.href = targetUrl;
      } else {
        // Desktop or unrecognized environments
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
        if (typeof fireAssistantEvent === 'function') {
          fireAssistantEvent('NAVIGATION_STARTED');
        }
      }
    } catch (err) {
      console.error("[STT Navigation] Error opening URI:", err);
      clearTimeout(heartbeat);
      setNavigationErrorTarget({ label, query, latitude, longitude });
      speakText("I found the destination, but I couldn't open your navigation app.");
      if (typeof fireAssistantEvent === 'function') {
        fireAssistantEvent('ERROR_NAVIGATION_FAILED');
      }
    }
  };

  // ---- STARTUP STATE AND REHYDRATION EFFECTS ----
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [isApiKeyExpiredAlert, setIsApiKeyExpiredAlert] = useState(false);
  const [apiKeyErrorMessage, setApiKeyErrorMessage] = useState("");

  // Parse URL query variables for shared polaroids at startup
  const [urlSharedPhoto, setUrlSharedPhoto] = useState<{
    url: string;
    caption: string;
    addedBy: string;
    date: string;
    title: string;
  } | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const url = params.get('sharedPhotoUrl');
        if (url) {
          return {
            url: url,
            caption: params.get('sharedPhotoCaption') || '',
            addedBy: params.get('sharedPhotoAddedBy') || 'Rhonda',
            date: params.get('sharedPhotoDate') || new Date().toLocaleDateString('en-US'),
            title: params.get('sharedPhotoTitle') || 'Polaroid Memory'
          };
        }
      }
    } catch (e) {
      console.warn("Error parsing URL shared photo query parameters:", e);
    }
    return null;
  });

  // ---- 1. USER PROFILE & BRANDING STATE ----
  const [profile, setProfile] = useState<UserProfile>(() => {
    const defaultProfile: UserProfile = {
      userId: 'user-rhonda-susan',
      name: 'Susan & Rhonda',
      email: 'rgallant@hr.com',
      branding: {
        logoUrl: '/src/assets/images/roaming_story_mockup_1779760776372.png',
        logoLocked: true,
        avatarUrl: '/src/assets/images/roamie_avatar_v4_1779827755840.png',
        avatarLocked: true,
        allowAiReplacement: false,
        persistAssets: true
      },
      settings: {
        voiceEnabled: true,
        responseMode: 'combined',
        handsFreeEnabled: true,
        smartInterruptEnabled: true,
        voiceAssistanceMode: 'drive',
        developerDebugMode: false,
        alwaysOnWakeWordEnabled: true
      }
    };
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...defaultProfile,
            ...parsed,
            branding: {
              ...defaultProfile.branding,
              ...(parsed.branding || {}),
              logoUrl: defaultProfile.branding.logoUrl, // Force restore official logo
              avatarUrl: defaultProfile.branding.avatarUrl, // Force restore official avatar
              logoLocked: true,
              avatarLocked: true
            },
            settings: {
              ...defaultProfile.settings,
              ...(parsed.settings || {})
            }
          };
        }
      } catch (e) {
        // Return default on error
      }
    }
    return defaultProfile;
  });

  // ---- 2. TRIPS DATABASE STATE ----
  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem(TRIPS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default
      }
    }
    
    // Default pre-populated trips (Ottawa and Cape Breton)
    return [
      {
        tripId: 'trip-ottawa',
        userId: 'user-rhonda-susan',
        type: 'upcoming',
        title: 'Ottawa Slow Strolls & Greenhouses',
        destination: 'Ottawa, ON',
        startDate: '2026-05-28',
        endDate: '2026-06-01',
        status: 'upcoming',
        itinerary: {
          days: [
            {
              dayNumber: 1,
              date: '2026-05-28',
              activities: [
                {
                  time: 'morning',
                  title: 'Arrive at Lord Elgin Hotel',
                  description: 'Settle in the historic lobby, short flat stroll to warm up.',
                  savedByAI: false
                },
                {
                  time: 'afternoon',
                  title: 'Majors Hill Park Viewpoint',
                  description: 'Relax on a shaded pathway bench overlooking the locks. Flat terrain is gentle on knees.',
                  savedByAI: true
                },
                {
                  time: 'evening',
                  title: 'Gluten-Free Garden Dinner',
                  description: 'Dine at Lavender Bistro. Low stress, quiet organic botanical ambience.',
                  savedByAI: false
                }
              ]
            },
            {
              dayNumber: 2,
              date: '2026-05-29',
              activities: [
                {
                  time: 'morning',
                  title: 'Rideau Canal Paths',
                  description: 'Quiet stroll before the sun gets too warm.',
                  savedByAI: false
                },
                {
                  time: 'afternoon',
                  title: 'National Gallery Greenhouse',
                  description: 'A beautiful indoor garden oasis with quiet seats.',
                  savedByAI: true
                }
              ]
            }
          ]
        },
        savedIdeas: [
          { text: 'Look into renting a slow taxi for a round-trip of the Gatineau park viewpoints.', createdAt: Date.now() - 3600000 },
          { text: 'Try the gluten-free bakery near Wellington West.', createdAt: Date.now() }
        ]
      },
      {
        tripId: 'trip-cape-breton',
        userId: 'user-rhonda-susan',
        type: 'upcoming',
        title: 'Cape Breton Coastal Solitude',
        destination: 'Cape Breton, NS',
        startDate: '2026-07-12',
        endDate: '2026-07-18',
        status: 'upcoming',
        itinerary: {
          days: [
            {
              dayNumber: 1,
              date: '2026-07-12',
              activities: [
                {
                  time: 'morning',
                  title: 'Scenic drive to Mabou Glen',
                  description: 'Drive along the seaside cliffs with light music.',
                  savedByAI: false
                }
              ]
            }
          ]
        },
        savedIdeas: []
      }
    ];
  });

  // ---- 3. CHAT DATABASE STATE (BY TRIP ID) ----
  const [chats, setChats] = useState<Record<string, TripChat>>(() => {
    const saved = localStorage.getItem(CHATS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default
      }
    }
    return {
      'trip-ottawa': {
        chatId: 'chat-ottawa',
        tripId: 'trip-ottawa',
        userId: 'user-rhonda-susan',
        messages: [
          {
            id: 'welcome-ott',
            role: 'avatar',
            type: 'text',
            content: "Hello! I'm Roamie, your AI companion. How can I help you and Susan today?",
            timestamp: Date.now(),
            senderName: 'Roamie'
          }
        ]
      }
    };
  });

  // ---- MODULE VIEW ROUTING ----
  const [activeScreen, setActiveScreen] = useState<'home' | 'chat' | 'itinerary' | 'settings' | 'drive'>(() => {
    return (localStorage.getItem('roamie_v3_last_screen') as any) || 'home';
  });
  const [activeTripId, setActiveTripId] = useState<string>('trip-ottawa');
  const [activeUser, setActiveUser] = useState<'Susan' | 'Rhonda'>('Rhonda');
  const [travelers, setTravelers] = useState<Traveler[]>(() => {
    const defaultTravelers: Traveler[] = [
      {
        userId: 'user-rhonda',
        name: 'Rhonda',
        displayName: 'Rhonda',
        accentColor: '#10b981', // Emerald green
        role: 'partner',
        bubbleStyle: 'solid'
      },
      {
        userId: 'user-susan',
        name: 'Susan',
        displayName: 'Susan',
        accentColor: '#8b5cf6', // Indigo/purple berry
        role: 'partner',
        bubbleStyle: 'solid'
      }
    ];
    const saved = localStorage.getItem(STORAGE_PREFIX + 'travelers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultTravelers;
  });

  // Look up config details for Rhonda or Susan
  const getTravelerConfig = (name: string): Traveler => {
    const defaultRhonda: Traveler = {
      userId: 'user-rhonda',
      name: 'Rhonda',
      displayName: 'Rhonda',
      accentColor: '#10b981', // green
      role: 'partner',
      bubbleStyle: 'solid'
    };
    const defaultSusan: Traveler = {
      userId: 'user-susan',
      name: 'Susan',
      displayName: 'Susan',
      accentColor: '#8b5cf6', // purple
      role: 'partner',
      bubbleStyle: 'solid'
    };
    
    const lowerName = name.toLowerCase().trim();
    if (lowerName === 'rhonda') {
      const match = travelers.find(t => t.name === 'Rhonda');
      return match || defaultRhonda;
    } else if (lowerName === 'susan') {
      const match = travelers.find(t => t.name === 'Susan');
      return match || defaultSusan;
    } else {
      // Find by displayName or name contains
      const match = travelers.find(t => t.displayName.toLowerCase() === lowerName || t.name.toLowerCase() === lowerName);
      if (match) return match;
    }
    
    return lowerName.includes('rhonda') ? defaultRhonda : defaultSusan;
  };

  const getUserColorStyle = (name: string) => {
    const config = getTravelerConfig(name);
    const hex = config.accentColor;
    const isRhonda = config.name === 'Rhonda';
    
    if (isRhonda) {
      return {
        text: 'text-[#10b981] dark:text-[#a7f3d0]',
        textOnDark: 'text-[#34d399]',
        bg: 'bg-[#10b981]/15',
        border: 'border-[#10b981]/30',
        chatBubble: 'bg-emerald-950/90 border border-emerald-800/80 text-emerald-100',
        bubbleBorder: 'border-emerald-800/60',
        accentBadge: 'bg-emerald-950/50 border border-emerald-800/60 text-[#34d399]',
        solidBg: 'bg-[#10b981]',
        indicator: 'bg-[#10b981]',
        hex: hex,
        nameColor: 'text-[#10b981] dark:text-[#a7f3d0]',
        roleColor: 'text-[#34d399]/85',
        role: config.role,
        displayName: config.displayName,
        bubbleStyle: config.bubbleStyle || 'solid'
      };
    } else {
      return {
        text: 'text-[#a78bfa] dark:text-[#ddd6fe]',
        textOnDark: 'text-[#c084fc]',
        bg: 'bg-[#8b5cf6]/15',
        border: 'border-[#8b5cf6]/30',
        chatBubble: 'bg-purple-950/90 border border-purple-900/80 text-purple-100',
        bubbleBorder: 'border-purple-800/60',
        accentBadge: 'bg-purple-950/50 border border-purple-800/60 text-[#c084fc]',
        solidBg: 'bg-[#8b5cf6]',
        indicator: 'bg-[#8b5cf6]',
        hex: hex,
        nameColor: 'text-[#a78bfa] dark:text-[#ddd6fe]',
        roleColor: 'text-[#c084fc]/85',
        role: config.role,
        displayName: config.displayName,
        bubbleStyle: config.bubbleStyle || 'solid'
      };
    }
  };

  // ---- HOME HAND-SKETCHED SECTIONS STATE ----
  const [activeTab, setActiveTab] = useState<'photos' | 'journal' | 'trips'>('photos');
  const [homeInputText, setHomeInputText] = useState<string>('');
  const [upcomingTripsExpanded, setUpcomingTripsExpanded] = useState<boolean>(false);
  const [pastTripsExpanded, setPastTripsExpanded] = useState<boolean>(false);
  
  const [photos, setPhotos] = useState<TripPhoto[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'photos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default
      }
    }
    return [
      {
        id: 'p-default-1',
        url: '/src/assets/images/roamie_avatar_v4_1779827755840.png',
        caption: 'Design consultation with ROAMIE',
        addedBy: 'Rhonda',
        timestamp: '11:42 AM'
      }
    ];
  });

  const [journals, setJournals] = useState<{ id: string; text: string; date: string; author: 'Rhonda' | 'Susan' }[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'journals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default
      }
    }
    return [
      { id: 'j-default-1', text: 'Spoke with ROAMIE today. She suggested the quiet path near Wellington West where Susan\'s knee can rest. We are so excited for the organic lilacs.', date: 'May 26, 2026', author: 'Susan' }
    ];
  });

  const [journalInputText, setJournalInputText] = useState<string>('');
  const photoUploadInputRef = useRef<HTMLInputElement>(null);

  // ---- UI INPUTS / MODALS STATE ----
  const [chatInputs, setChatInputs] = useState<Record<string, string>>({}); // tripId -> string
  const [isTyping, setIsTyping] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [deletedIdeas, setDeletedIdeas] = useState<{ tripId: string; text: string; deletedAt: number }[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'deleted_ideas');
    return saved ? JSON.parse(saved) : [];
  });
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // ---- RECYCLE BIN SYSTEM STATES ----
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [selectedTrashKeys, setSelectedTrashKeys] = useState<string[]>([]);

  // ---- ACTIVE ROUTING AND NAVIGATIONAL GPS ENGINE ----
  const [activeRouteTarget, setActiveRouteTarget] = useState<{ label: string; query: string } | null>(null);
  const [simulatedDistance, setSimulatedDistance] = useState<number>(0);
  const [isSimulatedRoutingActive, setIsSimulatedRoutingActive] = useState<boolean>(false);
  const [navigationTriggerSource, setNavigationTriggerSource] = useState<{ label: string; query: string } | null>(null);

  // Persistent Roaming co-pilot route parameters (Origin, Destination, Current position on route)
  const [suggestedPois, setSuggestedPois] = useState<{
    closestOnRoute: { name: string; detour: string };
    nextClosest: string;
    otherOptions: string[];
    isPendingGps: boolean;
  } | null>(null);

  const [roamingOrigin, setRoamingOrigin] = useState<string>(() => {
    return localStorage.getItem(STORAGE_PREFIX + 'roaming_origin') || "Onslow Mountain, NS";
  });
  const [roamingDestination, setRoamingDestination] = useState<string>(() => {
    return localStorage.getItem(STORAGE_PREFIX + 'roaming_destination') || "Cape Breton, NS";
  });
  const [roamingCurrentPosition, setRoamingCurrentPosition] = useState<string>(() => {
    return localStorage.getItem(STORAGE_PREFIX + 'roaming_current_position') || "Mile 14 - Highway 104, NS";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'roaming_origin', roamingOrigin);
  }, [roamingOrigin]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'roaming_destination', roamingDestination);
  }, [roamingDestination]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'roaming_current_position', roamingCurrentPosition);
  }, [roamingCurrentPosition]);

  // Sync roamingDestination with active trip destination
  useEffect(() => {
    const activeTrip = trips.find(t => t.tripId === activeTripId);
    if (activeTrip && activeTrip.destination) {
      setRoamingDestination(activeTrip.destination);
    }
  }, [activeTripId, trips]);

  // ---- MOBILE CAMERA & POLAROID MEMORIES STATES ----
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedPhotoForDetail, setSelectedPhotoForDetail] = useState<TripPhoto | null>(null);
  const [isSharingSimulated, setIsSharingSimulated] = useState<string | null>(null); // Type of share (text/email/airdrop etc)

  // Camera Snapshot Review State
  const [capturedPhotoPreview, setCapturedPhotoPreview] = useState<string | null>(null);
  const [capturedPhotoCaption, setCapturedPhotoCaption] = useState('');
  const [capturedPhotoTripId, setCapturedPhotoTripId] = useState('');
  const [capturedPhotoAlbumId, setCapturedPhotoAlbumId] = useState('');

  // Photo Album & Multi-Select Management States
  const [albums, setAlbums] = useState<{ id: string; name: string; createdAt: number }[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'photo_albums');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'album-scenery', name: 'Scenery', createdAt: Date.now() },
      { id: 'album-cafes', name: 'Cafés & Food', createdAt: Date.now() },
      { id: 'album-family', name: 'Rhonda & Susan', createdAt: Date.now() }
    ];
  });
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [isPhotoStudioOpen, setIsPhotoStudioOpen] = useState(false);
  const [activeStudioAlbumId, setActiveStudioAlbumId] = useState<string>('all');
  const [newAlbumNameInput, setNewAlbumNameInput] = useState('');
  const [isCreateAlbumPanelOpen, setIsCreateAlbumPanelOpen] = useState(false);
  const [multiSelectActive, setMultiSelectActive] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'photo_albums', JSON.stringify(albums));
  }, [albums]);

  // For speech synthesis
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() => {
    return localStorage.getItem('roamie_v3_selected_voice_uri') || '';
  });
  const selectedVoiceURIRef = useRef<string>('');

  useEffect(() => {
    selectedVoiceURIRef.current = selectedVoiceURI;
    if (selectedVoiceURI) {
      localStorage.setItem('roamie_v3_selected_voice_uri', selectedVoiceURI);
    }
  }, [selectedVoiceURI]);

  // ---- INTUITIVE MUSIC & BLUETOOTH DRIVE STATES ----
  const [musicProviders, setMusicProviders] = useState<any[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'music_providers_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((p: any) => p.id !== 'spotify');
      } catch (e) {}
    }
    return [
      { id: 'amazon', name: 'Amazon Music', status: 'enabled', logo: '🔷', deepLink: 'https://music.amazon.com/playlists/B07HG67H88', order: 0 },
      { id: 'apple', name: 'Apple Music', status: 'disabled', logo: '🍎', deepLink: 'https://music.apple.com', order: 2 },
      { id: 'youtube', name: 'YouTube Music', status: 'disabled', logo: '🔴', deepLink: 'https://music.youtube.com', order: 3 },
      { id: 'audible', name: 'Audible', status: 'disabled', logo: '⚫', deepLink: 'https://www.audible.com', order: 4 },
      { id: 'siriusxm', name: 'SiriusXM', status: 'disabled', logo: '📻', deepLink: 'https://www.siriusxm.com', order: 5 },
    ];
  });

  const [defaultMusicProviderId, setDefaultMusicProviderId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_PREFIX + 'default_music_provider_id') || 'amazon';
  });

  const [musicProvider, setMusicProvider] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'music_provider');
    if (saved) return saved;
    return localStorage.getItem(STORAGE_PREFIX + 'default_music_provider_id') || 'amazon';
  });

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [musicVolume, setMusicVolume] = useState(0.80);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_PREFIX + 'bluetooth_connected') === 'true';
  });
  const [selectedBluetoothDeviceName, setSelectedBluetoothDeviceName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_PREFIX + 'bluetooth_device_name') || 'None (Phone Speaker)';
  });
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState(false);
  const [isBluetoothScanning, setIsBluetoothScanning] = useState(false);
  const [bluetoothError, setBluetoothError] = useState<string | null>(null);
  const [bluetoothScanProgress, setBluetoothScanProgress] = useState(0);
  const [scannedBluetoothDevices, setScannedBluetoothDevices] = useState<{ name: string; type: 'car' | 'headphones' | 'speaker' | 'phone'; rssi: number; paired: boolean; address: string }[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'bluetooth_connected', isBluetoothConnected ? 'true' : 'false');
  }, [isBluetoothConnected]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'bluetooth_device_name', selectedBluetoothDeviceName);
  }, [selectedBluetoothDeviceName]);
  // Sync music provider settings
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'music_providers_list', JSON.stringify(musicProviders));
  }, [musicProviders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'default_music_provider_id', defaultMusicProviderId);
  }, [defaultMusicProviderId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'music_provider', musicProvider);
  }, [musicProvider]);

  // Simulates progress along our quiet road route
  useEffect(() => {
    let timer: any;
    if (isSimulatedRoutingActive && activeRouteTarget) {
      timer = setInterval(() => {
        setSimulatedDistance(prev => {
          if (prev <= 0.1) {
            clearInterval(timer);
            setIsSimulatedRoutingActive(false);
            setSuccessNotification(`Destined path complete: Welcome to ${activeRouteTarget.label}!`);
            setTimeout(() => setSuccessNotification(null), 3000);
            return 0;
          }
          return parseFloat((prev - 0.2).toFixed(1));
        });
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isSimulatedRoutingActive, activeRouteTarget]);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [declinedLocations, setDeclinedLocations] = useState<string[]>([]);
  const lastSuggestedLocationRef = useRef<{ name: string; query: string; info: string } | null>(null);
  const isDrivingListeningActiveRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const currentSpokenTextRef = useRef<string>('');

  const isSpeechRecognitionActiveRef = useRef(false);
  const lastErrorRef = useRef<string | null>(null);

  const activeTripIdRef = useRef(activeTripId);
  useEffect(() => {
    activeTripIdRef.current = activeTripId;
  }, [activeTripId]);

  const startPassiveWakeWordListener = () => {
    // Clear any pending restart timeouts to prevent race conditions
    if (wakeWordRestartTimeoutRef.current) {
      clearTimeout(wakeWordRestartTimeoutRef.current);
      wakeWordRestartTimeoutRef.current = null;
    }

    if (!profile.settings.alwaysOnWakeWordEnabled) {
      console.log("[WakeWord] Passive wake-word listener BLOCKED (Manual microphone mode is currently selected)");
      return;
    }
    if (!wakeWordRecognitionRef.current) return;
    
    // Safety check: Cannot start while active voice conversation is taking place
    if (isSpeechRecognitionActiveRef.current || roamieStateRef.current !== 'idle') {
      console.log("[WakeWord] Cannot start passive listener while state is not 'idle'");
      return;
    }
    
    // Safety check: Avoid starting if we just recently aborted (cooldown period of 1s)
    const now = Date.now();
    const timeSinceAbort = now - lastWakeWordAbortTimeRef.current;
    if (timeSinceAbort < 1000) {
      console.log(`[WakeWord] Throttled start request. Cooldown remaining: ${1000 - timeSinceAbort}ms`);
      // Schedule a delayed start instead
      wakeWordRestartTimeoutRef.current = setTimeout(startPassiveWakeWordListener, 1050 - timeSinceAbort);
      return;
    }

    // Safety check: Backoff if we've seen too many recent errors
    if (wakeWordErrorCountRef.current > 5) {
      console.warn("[WakeWord] Too many consecutive errors. Entering 10s cooldown backoff.");
      wakeWordRestartTimeoutRef.current = setTimeout(() => {
        wakeWordErrorCountRef.current = 0;
        startPassiveWakeWordListener();
      }, 10000);
      return;
    }

    if (isWakeWordListeningRef.current) {
      console.log("[WakeWord] Passive listener is already marked as active.");
      return;
    }

    try {
      wakeWordRecognitionRef.current.start();
      isWakeWordListeningRef.current = true;
      console.log("[WakeWord] Passive wake-word listener STARTED (Microphone ACTIVE strictly for wake-word)");
    } catch (e: any) {
      // Check if it's already started (common error if state mismatches)
      if (e.name === 'InvalidStateError' || e.message?.includes('already started')) {
        console.log("[WakeWord] Recognition already running (InvalidStateError ignored)");
        isWakeWordListeningRef.current = true;
      } else {
        console.warn("[WakeWord] Error starting passive wake-word listener:", e);
        isWakeWordListeningRef.current = false;
        wakeWordErrorCountRef.current++;
      }
    }
  };

  const stopPassiveWakeWordListener = () => {
    if (!wakeWordRecognitionRef.current) return;
    
    // Clear any pending restart timers
    if (wakeWordRestartTimeoutRef.current) {
      clearTimeout(wakeWordRestartTimeoutRef.current);
      wakeWordRestartTimeoutRef.current = null;
    }

    if (!isWakeWordListeningRef.current) return;

    try {
      lastWakeWordAbortTimeRef.current = Date.now();
      wakeWordRecognitionRef.current.abort();
      console.log("[WakeWord] stopPassiveWakeWordListener: abort() triggered");
    } catch (e) {
      console.warn("[WakeWord] Error aborting passive wake-word listener:", e);
    } finally {
      isWakeWordListeningRef.current = false;
    }
  };

  const playToneAndStartActiveVoiceSession = () => {
    stopPassiveWakeWordListener();
    playListeningTone();
    setIsVoiceEngineActivated(true);
    isVoiceEngineActivatedRef.current = true;
    
    // Small delay to ensure mic handoff is clean and audio tone finishes
    setTimeout(() => {
      transitionToState('listening');
    }, 150);
  };

  const safeStartRecognition = () => {
    if (!recognitionRef.current) return;
    if (isSpeechRecognitionActiveRef.current) {
      console.log("[STT] Already active, skipping start");
      return;
    }

    // Always stop passive listener before starting active session to hand off device microphone cleanly
    if (isWakeWordListeningRef.current) {
      stopPassiveWakeWordListener();
    }

    try {
      recognitionRef.current.start();
      isSpeechRecognitionActiveRef.current = true;
      setIsListening(true);
      console.log("MICROPHONE_ACTIVE");
      console.log("VOICE_SESSION_STARTED");
    } catch (e) {
      console.warn("[STT] Error starting recognition:", e);
      isSpeechRecognitionActiveRef.current = false;
      setIsListening(false);
    }
  };

  const safeStopRecognition = () => {
    if (!recognitionRef.current) return;
    if (!isSpeechRecognitionActiveRef.current) return;
    try {
      recognitionRef.current.stop();
      console.log("VOICE_SESSION_ENDED");
    } catch (e) {
      console.warn("[STT] Error stopping recognition:", e);
    } finally {
      isSpeechRecognitionActiveRef.current = false;
      setIsListening(false);
      console.log("MICROPHONE_RETURNED_TO_IDLE");
    }
  };

  const safeCancelSpeech = () => {
    if (!window.speechSynthesis) return;
    if (activeUtteranceRef.current) {
      activeUtteranceRef.current.onstart = null;
      activeUtteranceRef.current.onend = null;
      activeUtteranceRef.current.onerror = null;
      activeUtteranceRef.current = null;
    }
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("Error canceling speech synthesis:", e);
    }
    isSpeakingRef.current = false;
    setSpeakingMsgId(null);
  };

  const transitionToState = (nextState: 'idle' | 'listening' | 'processing' | 'speaking') => {
    console.log(`[RoamieState] Transitioning state: ${roamieStateRef.current} -> ${nextState}`);
    
    // Safety exit hooks per state
    if (roamieStateRef.current === 'listening') {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }

    roamieStateRef.current = nextState;
    setRoamieState(nextState);

    // Entry hooks per state
    if (nextState === 'idle') {
      isDrivingListeningActiveRef.current = false;
      safeCancelSpeech();
      safeStopRecognition(); // Turn active microphone OFF
      
      // Automatically start the passive wake-word listener on all screens
      startPassiveWakeWordListener();
    } else if (nextState === 'listening') {
      isDrivingListeningActiveRef.current = true;
      safeCancelSpeech();

      // Clear any existing silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      const silenceDuration = (isFollowUpRef.current || hasAskedNavigationQuestionRef.current) ? 15000 : 8000;
      // Start silence timer to auto-transition to idle and save battery
      silenceTimerRef.current = setTimeout(() => {
        if (roamieStateRef.current === 'listening') {
          console.log("[STT] Silence timeout. Transitioning back to sleep state 'idle'.");
          setSpeechFeedback("Roamie is asleep. Say 'Hey Roamie' to wake her.");
          setIsVoiceEngineActivated(false);
          isVoiceEngineActivatedRef.current = false;
          safeStopRecognition();
          transitionToState('idle');
        }
      }, silenceDuration);

      // Safe slight delay to give the hardware microphone and audio focus streams time to cycle
      setTimeout(() => {
        if (roamieStateRef.current === 'listening') {
          safeStartRecognition();
        }
      }, 80);
    } else if (nextState === 'processing') {
      isDrivingListeningActiveRef.current = false;
      safeStopRecognition(); // Turn active microphone OFF
    } else if (nextState === 'speaking') {
      isDrivingListeningActiveRef.current = false;
      safeStopRecognition(); // Turn active microphone OFF during vocal playback
    }
  };

  // Refs for tracking async state closures in speech callbacks
  const activeScreenRef = useRef(activeScreen);
  const responseModeRef = useRef(profile.settings.responseMode);

  useEffect(() => {
    activeScreenRef.current = activeScreen;
    localStorage.setItem(STORAGE_PREFIX + 'last_screen', activeScreen);

    // Keep the passive wake-word listener active on all screens during idle states
    if (roamieStateRef.current === 'idle') {
      startPassiveWakeWordListener();
    }
  }, [activeScreen]);

  useEffect(() => {
    responseModeRef.current = profile.settings.responseMode;
  }, [profile.settings.responseMode]);

  const isAlwaysListeningActive = () => {
    if (!isVoiceEngineActivatedRef.current) return false;
    return activeScreenRef.current === 'drive' || responseModeRef.current === 'voice' || responseModeRef.current === 'combined';
  };

  // ---- PWA INSTALLATION HOOKS AND INITIAL STATES ----
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    console.log("APP_STARTED");
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsAppInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const activeUserRef = useRef(activeUser);
  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  // For custom itinerary builder form
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [newActivity, setNewActivity] = useState<{
    time: 'morning' | 'afternoon' | 'evening' | 'custom';
    title: string;
    description: string;
  }>({
    time: 'morning',
    title: '',
    description: ''
  });

  // For creating physical trip
  const [newTripData, setNewTripData] = useState({
    destination: '',
    title: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  // ---- SPEECH RECOGNITION (STT) STUFF ----
  const [isListening, setIsListening] = useState(false);
  const [roamieState, setRoamieState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const roamieStateRef = useRef<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const recognitionRef = useRef<any>(null);
  const wakeWordRecognitionRef = useRef<any>(null);
  const isWakeWordListeningRef = useRef<boolean>(false);
  const lastWakeWordAbortTimeRef = useRef<number>(0);
  const wakeWordErrorCountRef = useRef<number>(0);
  const wakeWordRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);
  const nextStateAfterSpeechRef = useRef<'idle' | 'listening'>('idle');
  const silenceTimerRef = useRef<any>(null);
  const [isVoiceEngineActivated, setIsVoiceEngineActivated] = useState(false);
  const isVoiceEngineActivatedRef = useRef(false);

  const hasAskedNavigationQuestionRef = useRef(false);
  const isFollowUpRef = useRef(false);
  const [navigationErrorTarget, setNavigationErrorTarget] = useState<{ label: string; query: string; latitude: number; longitude: number } | null>(null);

  const [assistantEvents, setAssistantEvents] = useState<Array<{ name: string; timestamp: number }>>([]);
  const [debugLatestUserSaid, setDebugLatestUserSaid] = useState<string>('');
  const [debugLatestSentToAI, setDebugLatestSentToAI] = useState<string>('');
  const [debugLatestIntent, setDebugLatestIntent] = useState<string>('');
  const [debugLatestAIResponse, setDebugLatestAIResponse] = useState<string>('');
  const [quickStopState, setQuickStopState] = useState<{
    active: boolean;
    category: string;
    results: Array<{ name: string; distance: number; query: string }>;
    index: number;
  } | null>(null);

  const fireAssistantEvent = (eventName: string) => {
    console.log(`[Roamie Event] ${eventName}`);
    setAssistantEvents(prev => [{ name: eventName, timestamp: Date.now() }, ...prev].slice(0, 8));
  };

  const playListeningTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playBeep = (freq: number, delay: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + delay + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
        
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };
      
      playBeep(523.25, 0, 0.15); // C5
      playBeep(659.25, 0.08, 0.2); // E5
    } catch (e) {
      console.warn("AudioContext tone blocked or not supported:", e);
    }
  };

  const handleQuickStopSearch = async (categoryName: string) => {
    fireAssistantEvent('PLACES_SEARCH_STARTED');
    
    // Auto-activate voice engine to enable hands-free listening and real-time response
    setIsVoiceEngineActivated(true);
    isVoiceEngineActivatedRef.current = true;
    
    let lat: number | null = null;
    let lng: number | null = null;
    
    try {
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        fireAssistantEvent('GPS_LOCATION_ACQUIRED');
      } else {
        fireAssistantEvent('ERROR_LOCATION_UNAVAILABLE');
      }
    } catch (err) {
      console.warn("Geolocation in handleQuickStopSearch failed:", err);
      // Fallback: Onslow Mountain, NS coordinates as failsafe
      lat = 45.4167;
      lng = -63.2667;
    }

    setIsTyping(true);
    transitionToState('processing');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Find nearby ${categoryName}`,
          activePartner: activeUser,
          latitude: lat,
          longitude: lng,
          DRIVING_MODE: activeScreen === 'drive' ? "TRUE" : "FALSE",
          VOICE_ASSISTANCE_MODE: profile.settings.voiceAssistanceMode || 'drive',
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsTyping(false);

      if (data.places && data.places.length > 0) {
        const mappedResults = data.places.map((p: any) => ({
          name: p.place_name,
          distance: p.distance_km,
          query: p.address || p.place_name,
          lat: p.lat,
          lng: p.lng,
          address: p.address
        }));

        setQuickStopState({
          active: true,
          category: categoryName,
          results: mappedResults,
          index: 0
        });

        fireAssistantEvent('PLACE_SELECTED');

        const firstResult = mappedResults[0];
        const speakTextStr = data.text || `I found ${firstResult.name} ${firstResult.distance.toFixed(1)} kilometres away. Would you like me to navigate there?`;

        lastSuggestedLocationRef.current = {
          name: firstResult.name,
          query: firstResult.query,
          info: speakTextStr
        };

        hasAskedNavigationQuestionRef.current = true;
        isFollowUpRef.current = true;

        speakText(speakTextStr, undefined, 'listening');
        setSpeechFeedback(speakTextStr);
      } else {
        fireAssistantEvent('PLACES_RESULTS_RECEIVED');
        const fallbackText = data.text || `I checked near your location but couldn't find any nearby ${categoryName}.`;
        speakText(fallbackText);
        setSpeechFeedback(fallbackText);
      }
    } catch (apiError) {
      console.error("Quick stop search backend call error:", apiError);
      setIsTyping(false);
      speakText("I am having trouble connecting to the travel assistant database right now.");
    }
  };

  useEffect(() => {
    isVoiceEngineActivatedRef.current = isVoiceEngineActivated;
  }, [isVoiceEngineActivated]);

  // Sync state to IndexedDB and localStorage safely
  useEffect(() => {
    async function rehydrateBranding() {
      try {
        const storedLogo = await loadBrandingAsset('logoUrl');
        const storedAvatar = await loadBrandingAsset('avatarUrl');
        
        setProfile(prev => {
          const updatedBranding = { ...prev.branding };
          let changed = false;
          if (storedLogo && storedLogo !== prev.branding.logoUrl) {
            updatedBranding.logoUrl = storedLogo;
            updatedBranding.logoLocked = true;
            changed = true;
          }
          if (storedAvatar && storedAvatar !== prev.branding.avatarUrl) {
            updatedBranding.avatarUrl = storedAvatar;
            updatedBranding.avatarLocked = true;
            changed = true;
          }
          return changed ? { ...prev, branding: updatedBranding } : prev;
        });
      } catch (err) {
        console.error("Failed to rehydrate branding asset stores on startup:", err);
      } finally {
        // Guarantee at least a 1.2 second beautiful splash presenting effect to ensure perfect PWA startup transitions
        setTimeout(() => {
          setIsSplashActive(false);
        }, 1200);
      }
    }
    rehydrateBranding();
  }, []);

  // Sync state to local storage safely
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn("localStorage quota exceeded when syncing profile state, falling back on custom IndexedDB chunks", e);
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  }, [trips]);

  // Clean old deleted trips (auto-delete after 30 days) on load
  useEffect(() => {
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    setTrips(prev => {
      const filtered = prev.filter(t => {
        if (t.status === 'deleted' && t.deletedAt) {
          return now - t.deletedAt < thirtyDaysInMs;
        }
        return true;
      });
      if (filtered.length !== prev.length) {
        return filtered;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'photos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'deleted_ideas', JSON.stringify(deletedIdeas));
  }, [deletedIdeas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'journals', JSON.stringify(journals));
  }, [journals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'travelers', JSON.stringify(travelers));
  }, [travelers]);

  // ---- SMART MEDIA SYNC & BLUETOOTH CAR AUDIO FOCUS ----
  useEffect(() => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.play().catch(err => {
        console.warn("Audio play gesture request blocked on this viewport context:", err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isMusicPlaying, currentTrackIndex]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (speakingMsgId !== null) {
      // Gracefully duck the simulated music volume to 15% when Roamie speaks
      audioRef.current.volume = musicVolume * 0.15;
    } else {
      // Restore standard volume
      audioRef.current.volume = musicVolume;
    }
  }, [speakingMsgId, musicVolume]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      const activeTrack = DRIVE_TRACKS[currentTrackIndex];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: activeTrack.title,
        artist: activeTrack.artist,
        album: 'Roamie Safe Drive',
        artwork: [
          { src: activeTrack.albumArt, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => setIsMusicPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsMusicPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => handleSkipTrack(true));
      navigator.mediaSession.setActionHandler('nexttrack', () => handleSkipTrack(false));
    } catch (e) {
      console.warn("MediaSession configuration ignored:", e);
    }
  }, [currentTrackIndex, isMusicPlaying]);

  // ---- NATIVE & INTERACTIVE VEHICLE BLUETOOTH PAIRING & AUDIO SYSTEM ----
  const [isPairingDeviceName, setIsPairingDeviceName] = useState<string | null>(null);

  const startBluetoothScan = async () => {
    setIsBluetoothScanning(true);
    setBluetoothScanProgress(0);
    setBluetoothError(null);
    setScannedBluetoothDevices([]);

    // 1. First attempt native navigator.bluetooth.requestDevice for Chrome/Android compliance
    if (typeof window !== 'undefined' && (navigator as any).bluetooth) {
      try {
        console.log("[Bluetooth Engine] Spawning active navigator.bluetooth request device popup...");
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true
        });
        if (device) {
          console.log("[Bluetooth Engine] Native Web Bluetooth paired device named:", device.name);
          setSelectedBluetoothDeviceName(device.name || "Bluetooth Onboard Target");
          setIsBluetoothConnected(true);
          speakText(`Bluetooth link connected to ${device.name || "your vehicle stream"}.`);
          setIsBluetoothScanning(false);
          setIsBluetoothModalOpen(false);
          return;
        }
      } catch (err: any) {
        console.warn("[Bluetooth Engine] Native query canceled or security blocked. Running local scan fallback:", err);
        setBluetoothError("Web Bluetooth API selection closed or sandbox blocked. Showing interactive dashboard selector.");
      }
    } else {
      setBluetoothError("Web Bluetooth API is unsupported on this browser. Initiating vehicle cockpit scanning console.");
    }

    // 2. High fidelity simulated scanning progression for testing within sandboxed preview iframes
    let progVal = 0;
    const scanTimer = setInterval(() => {
      progVal += 10;
      setBluetoothScanProgress(progVal);

      if (progVal === 20) {
        setScannedBluetoothDevices(prev => [...prev, { name: "My Volvo XC60 Media", type: 'car', rssi: -48, address: "00:1A:7D:DA:71:11", paired: true }]);
      } else if (progVal === 40) {
        setScannedBluetoothDevices(prev => [...prev, { name: "Bose QuietComfort 45", type: 'headphones', rssi: -62, address: "14:8F:C6:23:44:E2", paired: true }]);
      } else if (progVal === 60) {
        setScannedBluetoothDevices(prev => [...prev, { name: "Android Auto Radio Gateway v4A", type: 'car', rssi: -55, address: "24:4B:03:F1:AA:50", paired: false }]);
      } else if (progVal === 80) {
        setScannedBluetoothDevices(prev => [...prev, 
          { name: "Susan's AirPods Pro", type: 'headphones', rssi: -72, address: "F0:18:98:A2:70:0C", paired: false },
          { name: "JBL Flip 6 Speak-Box", type: 'speaker', rssi: -79, address: "E0:A2:44:A2:1F:B2", paired: false }
        ]);
      } else if (progVal === 100) {
        setScannedBluetoothDevices(prev => [...prev, { name: "Toyota Entune Media Line", type: 'car', rssi: -86, address: "78:31:C1:22:11:AB", paired: false }]);
        setIsBluetoothScanning(false);
        clearInterval(scanTimer);
      }
    }, 200);
  };

  const handleLaunchAndroidBluetoothSettings = () => {
    try {
      console.log("[Bluetooth Engine] Dispatching native settings intent redirect...");
      window.location.href = "intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;category=android.intent.category.DEFAULT;end";
    } catch (e) {
      console.error("[Bluetooth Engine] Intent redirect error:", e);
      alert("Android Bluetooth Settings intent is only supported on Android devices.");
    }
  };

  const handleDisconnectBluetooth = () => {
    setIsBluetoothConnected(false);
    setSelectedBluetoothDeviceName("None (Phone Speaker)");
    speakText("Bluetooth connection severed. Routing audio stream through handset speaker.");
    setSuccessNotification("Bluetooth stream disconnected.");
    setTimeout(() => setSuccessNotification(null), 3000);
  };

  const connectToScannedDevice = (deviceName: string) => {
    setIsPairingDeviceName(deviceName);
    speakText(`Linking with ${deviceName}... Securing remote stereo stream connectivity...`);
    
    // Simulate active pairing handshake
    setTimeout(() => {
      setSelectedBluetoothDeviceName(deviceName);
      setIsBluetoothConnected(true);
      setIsPairingDeviceName(null);
      speakText(`Bluetooth connection secured with ${deviceName}. Routing navigation prompts, voice cockpit, and music.`);
      setSuccessNotification(`Successfully linked audio to ${deviceName}`);
      setIsBluetoothModalOpen(false);
      setTimeout(() => setSuccessNotification(null), 3000);
    }, 1800);
  };

  const getRoamieVoice = (voicesList: SpeechSynthesisVoice[]) => {
    if (!voicesList || voicesList.length === 0) {
      console.log("VOICE_FALLBACK_BLOCKED");
      return null;
    }
    
    // 1. If we have a user-selected voice stored in our persistent ref, find that exactly
    const targetURI = selectedVoiceURIRef.current || selectedVoiceURI;
    if (targetURI) {
      const match = voicesList.find(v => v.voiceURI === targetURI);
      if (match) {
        console.log("VOICE_ENGINE_NEURAL_ACTIVE");
        return match;
      }
    }

    // 2. Otherwise, find the best elegant female/warm english voice
    const femaleKeywords = ['samantha', 'zira', 'google us english', 'google uk english female', 'karen', 'fiona', 'hazel', 'veena', 'natural', 'female', 'susan', 'tessa', 'victoria', 'moira'];
    
    for (const kw of femaleKeywords) {
      const found = voicesList.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes(kw));
      if (found) {
        console.log("VOICE_ENGINE_NEURAL_ACTIVE");
        return found;
      }
    }
    
    // Exclude male names to avoid male fallbacks
    const maleKeywords = ['david', 'daniel', 'mark', 'george', 'male', 'ravi', 'heera', 'zarvox', 'microsoft david', 'google us english male'];
    const anyFemaleNeutralEnglish = voicesList.find(v => v.lang.startsWith('en') && !maleKeywords.some(m => v.name.toLowerCase().includes(m)));
    if (anyFemaleNeutralEnglish) {
      console.log("VOICE_ENGINE_NEURAL_ACTIVE");
      return anyFemaleNeutralEnglish;
    }

    // 3. Fallback to any English voice
    const anyEnglish = voicesList.find(v => v.lang.startsWith('en'));
    if (anyEnglish) {
      console.log("VOICE_ENGINE_NEURAL_ACTIVE_FALLBACK_EN");
      return anyEnglish;
    }

    // 4. Fallback to absolutely any voice
    if (voicesList.length > 0) {
      console.log("VOICE_ENGINE_NEURAL_ACTIVE_FALLBACK_ANY");
      return voicesList[0];
    }

    console.log("VOICE_FALLBACK_BLOCKED");
    return null;
  };

  // Initializing system voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const syncVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      if (voices.length > 0) {
        const preferred = getRoamieVoice(voices);
        if (preferred) {
          setSelectedVoiceURI(preferred.voiceURI);
        }
      }
    };

    syncVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = syncVoices;
    }
  }, []);

  const handleSkipTrack = (isPrev = false) => {
    setCurrentTrackIndex(prev => {
      if (isPrev) {
        return prev === 0 ? DRIVE_TRACKS.length - 1 : prev - 1;
      } else {
        return prev === DRIVE_TRACKS.length - 1 ? 0 : prev + 1;
      }
    });
  };

  const handleVoiceCommand = (rawTranscript: string) => {
    console.log(`[VOICE_PIPELINE] Command Dispatch triggered: "${rawTranscript}"`);
    setDebugLatestUserSaid(rawTranscript);
    
    // Detect local intent
    const testLower = rawTranscript.toLowerCase().trim();
    if (testLower.includes("play") || testLower.includes("music") || testLower.includes("song") || testLower.includes("playlist")) {
      setDebugLatestIntent("Music Media Playback");
    } else if (testLower.includes("save a memory") || testLower.includes("save memory") || testLower.includes("snapshot") || testLower.includes("save this memory")) {
      setDebugLatestIntent("Save Travel Memory");
    } else if (testLower.includes("save voice note") || testLower.includes("save note")) {
      setDebugLatestIntent("Save Journal Voice Note");
    } else if (testLower.includes("navigate") || testLower.includes("gps") || testLower.includes("take me") || testLower.includes("take us") || testLower.includes("go to")) {
      setDebugLatestIntent("GPS Navigation Request");
    } else if (testLower.includes("stop") || testLower.includes("thank you") || testLower.includes("go to sleep")) {
      setDebugLatestIntent("Exit Voice Session");
      speakText("Understood. Roamie is going to sleep. Say 'Hey Roamie' if you need anything else!");
      setIsVoiceEngineActivated(false);
      isVoiceEngineActivatedRef.current = false;
      transitionToState('idle');
      return;
    } else if (testLower.includes("weather") || testLower.includes("forecast") || testLower.includes("temp")) {
      setDebugLatestIntent("Weather Info Inquiry");
    } else {
      setDebugLatestIntent("General Query / Routing to AI");
    }

    // True real-time interrupt: if she is talking/thinking, cancel speech immediately and listen
    if (roamieStateRef.current === 'processing' || roamieStateRef.current === 'speaking' || isSpeakingRef.current) {
      console.log("[STT Interrupt] Intercepted speaking/processing state in handleVoiceCommand. Stopping speech.");
      safeCancelSpeech();
      isSpeakingRef.current = false;
      transitionToState('listening');
    }

    let transcript = rawTranscript.toLowerCase().trim();
    if (!transcript) return;

    if (typeof fireAssistantEvent === 'function') {
      fireAssistantEvent('VOICE_COMMAND_RECEIVED');
    }

    // Defined once for the whole function scope
    const getActiveSuggestedLocation = () => {
      if (lastSuggestedLocationRef.current) {
        return lastSuggestedLocationRef.current;
      }
      if (suggestedPois && suggestedPois.closestOnRoute && suggestedPois.closestOnRoute.name) {
        return {
          name: suggestedPois.closestOnRoute.name,
          query: `${suggestedPois.closestOnRoute.name}, Nova Scotia`,
          info: suggestedPois.closestOnRoute.name
        };
      }
      return null;
    };

    const activeLoc = getActiveSuggestedLocation();

    const isNavigateAction = transcript === 'navigate there' || 
                             transcript === 'navigate to it' || 
                             transcript === 'take me there' || 
                             transcript === 'take us there' ||
                             transcript.startsWith('navigate there') ||
                             transcript.startsWith('take me there') ||
                             transcript.includes('navigate to it') ||
                             transcript === "yes" || 
                             transcript.includes("yes please") || 
                             transcript.includes("let's go") || 
                             transcript === "sure" || 
                             transcript === "okay" || 
                             transcript === "do it";

    const isAddAction = transcript === 'add to route' || 
                        transcript === 'add this to my gps' || 
                        transcript === 'add it to route' ||
                        transcript === 'add it to my gps' ||
                        transcript.startsWith('add to route') ||
                        transcript.includes('add this to my gps') ||
                        transcript.includes('add it to my gps') ||
                        transcript.includes("add it") || 
                        transcript.includes("add to route") || 
                        transcript.includes("add to my route");

    const isSkipAction = transcript === 'skip' || 
                         transcript === 'skip it' || 
                         transcript === 'no thanks' || 
                         transcript === 'no thank you' || 
                         transcript === 'cancel' ||
                         transcript.startsWith('skip') ||
                         transcript === "no" || 
                         transcript.includes("skip it") || 
                         transcript.includes("not now") || 
                         transcript === "next" || 
                         transcript === "another";

    // 1. Check if we have an active quick stop state in progress
    if (quickStopState && quickStopState.active) {
      const affirmatives = [
        "yes", "yeah", "yep", "sure", "okay", "ok", "please", "go ahead", "do it",
        "navigate", "take me there", "let's go", "start navigation"
      ];
      const matchesAffirmative = affirmatives.some(a => transcript === a || transcript.startsWith(a + " ") || transcript.includes(" " + a));
      
      const negatives = [
        "no", "nay", "don't", "dont", "no thanks", "no thank you", "nope", 
        "not now", "negative", "cancel", "keep current route", "keep route", 
        "stay on the current route", "do not", "refuse"
      ];
      const matchesNegative = negatives.some(n => transcript === n || transcript.startsWith(n + " ") || transcript.includes(" " + n));

      const isYes = matchesAffirmative || 
                    transcript.includes("navigate") || 
                    transcript.includes("take me there") || 
                    transcript.includes("let's go") || 
                    transcript.includes("start navigation") || 
                    transcript.includes("take us there");
      const isNo = matchesNegative || transcript.includes("another") || transcript.includes("skip") || transcript.includes("next");
      const isShowMore = transcript.includes("show more") || transcript.includes("more options") || transcript.includes("show other options");

      if (isYes) {
        if (typeof fireAssistantEvent === 'function') {
          fireAssistantEvent('NAVIGATION_REQUESTED');
        }
        const activePOI = quickStopState.results[quickStopState.index];
        setActiveRouteTarget({
          label: activePOI.name,
          query: activePOI.query
        });
        setIsSimulatedRoutingActive(true);
        setSimulatedDistance(activePOI.distance);
        setQuickStopState(null);
        hasAskedNavigationQuestionRef.current = false;
        isFollowUpRef.current = false;
        
        // Transition State Machine to IDLE and launch navigation immediately
        transitionToState('idle');
        const targetLabel = lastSuggestedLocationRef.current?.name || activePOI.name;
        const targetQuery = lastSuggestedLocationRef.current?.query || activePOI.query;
        launchDeviceNavigation(targetLabel, targetQuery);
        return;
      }

      if (isNo) {
        if (activeLoc) {
          setDeclinedLocations(prev => [...prev, activeLoc.name]);
        }
        setQuickStopState(null);
        hasAskedNavigationQuestionRef.current = false;
        isFollowUpRef.current = false;
        lastSuggestedLocationRef.current = null;
        speakText("Understood. We'll stay on the current route.", undefined, 'idle');
        setSpeechFeedback("Understood. We'll stay on the current route.");
        return;
      }

      if (isShowMore) {
        const nextThree = quickStopState.results.slice(quickStopState.index + 1, quickStopState.index + 4);
        if (nextThree.length > 0) {
          const namesStr = nextThree.map(p => `${p.name} — ${p.distance.toFixed(1)} km`).join(", ");
          speakText(`Here are other options nearby: ${namesStr}. Would you like directions to any of these?`);
          setSpeechFeedback(`Next options: ${namesStr}`);
        } else {
          speakText("There are no other options nearby.");
        }
        return;
      }
    }

    // 2. Map explicit search voice triggers to handleQuickStopSearch
    const isCoffee = transcript.includes("coffee") || transcript.includes("starbucks") || transcript.includes("cafe") || transcript.includes("caffeine");
    const isGas = transcript.includes("gas") || transcript.includes("fuel") || transcript.includes("refuel") || transcript.includes("station");
    const isFood = transcript.includes("food") || transcript.includes("restaurant") || transcript.includes("eat") || transcript.includes("dining") || transcript.includes("dinner") || transcript.includes("lunch");
    const isRestArea = transcript.includes("rest area") || transcript.includes("rest stop") || transcript.includes("pit stop") || transcript.includes("parking") || transcript.includes("stops");
    const isPharmacy = transcript.includes("pharmacy") || transcript.includes("drugstore") || transcript.includes("chemist") || transcript.includes("prescription") || transcript.includes("drug store");
    const isHospital = transcript.includes("hospital") || transcript.includes("emergency") || transcript.includes("medical") || transcript.includes("clinic");
    const isBeach = transcript.includes("beach") || transcript.includes("shore") || transcript.includes("cove");
    const isThrift = transcript.includes("thrift") || transcript.includes("thrifting") || transcript.includes("second-hand") || transcript.includes("second hand") || transcript.includes("charity shop") || transcript.includes("consignment") || transcript.includes("vintage store");
    const isHiking = transcript.includes("hiking") || transcript.includes("hike") || transcript.includes("mountain");
    const isWalking = transcript.includes("walking") || transcript.includes("nature walk") || transcript.includes("scenic walk") || transcript.includes("boardwalk") || transcript.includes("walk");
    const isGrocery = transcript.includes("grocery") || transcript.includes("supermarket") || transcript.includes("market") || transcript.includes("grocery store");

    const isSearchTrigger = transcript.startsWith("find ") || transcript.startsWith("get ") || transcript.startsWith("search ") || transcript.startsWith("show ") || transcript.startsWith("take me ") || transcript.includes("nearby") || transcript.includes("nearest");

    if (isSearchTrigger) {
      // Filter out declined locations
      const filterDeclined = (name: string) => !declinedLocations.includes(name);

      if (isCoffee) return handleQuickStopSearch('Coffee');
      if (isGas) return handleQuickStopSearch('Gas');
      if (isFood) return handleQuickStopSearch('Food');
      if (isRestArea) return handleQuickStopSearch('Rest Stop');
      if (isPharmacy) return handleQuickStopSearch('Pharmacy');
      if (isHospital) return handleQuickStopSearch('Hospital');
      if (isBeach) return handleQuickStopSearch('Beach');
      if (isThrift) return handleQuickStopSearch('Thrift Store');
      if (isGrocery) return handleQuickStopSearch('Grocery');
      if (isHiking) return handleQuickStopSearch('Hiking');
      if (isWalking) return handleQuickStopSearch('Trail / Walking Trail');
    }

    if (transcript.includes("what's nearby") || transcript.includes("whats nearby") || transcript.includes("what is nearby")) {
      speakText("There are several quick stops on our route, Susan. You can ask me to find coffee, gas, food, or hiking trails nearby!");
      return;
    }

    // Support navigate home / to destination commands
    if (transcript.includes("navigate home") || transcript.includes("go home") || transcript.includes("take me home")) {
      if (typeof fireAssistantEvent === 'function') {
        fireAssistantEvent('NAVIGATION_REQUESTED');
      }
      setActiveRouteTarget({
        label: "Susan & Rhonda's Home",
        query: "Halifax, Nova Scotia"
      });
      setIsSimulatedRoutingActive(true);
      setSimulatedDistance(15.0);
      speakText("Starting navigation home.");
      if (typeof fireAssistantEvent === 'function') {
        fireAssistantEvent('NAVIGATION_STARTED');
      }
      setTimeout(() => {
        launchDeviceNavigation("Home", "Halifax, Nova Scotia");
      }, 1500);
      return;
    }

    if (transcript.includes("navigate to destination") || transcript.includes("go to destination") || transcript.includes("take us there") || transcript === "take me there") {
      if (typeof fireAssistantEvent === 'function') {
        fireAssistantEvent('NAVIGATION_REQUESTED');
      }
      const dest = roamingDestination || "Truro, Nova Scotia";
      setActiveRouteTarget({
        label: dest,
        query: dest
      });
      setIsSimulatedRoutingActive(true);
      setSimulatedDistance(24.5);
      speakText("Starting navigation now.");
      if (typeof fireAssistantEvent === 'function') {
        fireAssistantEvent('NAVIGATION_STARTED');
      }
      setTimeout(() => {
        launchDeviceNavigation(dest, dest);
      }, 1500);
      return;
    }

    // VOICE STOP COMMANDS (CRITICAL REQUIREMENT) - Transition back to Sleeping (idle) state
    const isExit = transcript.includes("thank you roamie") ||
                   transcript.includes("thank you romy") ||
                   transcript.includes("thanks roamie") ||
                   transcript.includes("thanks romy") ||
                   transcript.includes("stop roamie") ||
                   transcript.includes("stop romy") ||
                   transcript === "thank you" ||
                   transcript === "thanks" ||
                   transcript === "stop" ||
                   transcript === "exit voice" ||
                   transcript === "pause listening" ||
                   transcript === "go to sleep";

    if (isExit) {
      safeCancelSpeech();
      setIsVoiceEngineActivated(false);
      isVoiceEngineActivatedRef.current = false;
      safeStopRecognition();
      transitionToState('idle');
      setSpeechFeedback("Roamie went to sleep.");
      speakText("Understood. Let me know if you need anything else.");
      return;
    }

    // Standardize wake phrases and instructions
    const wakeWords = /^(hey\s+rom[yi]|ok\s+rom[yi]|rom[yi]|hey\s+roamie|ok\s+roamie|roamie)\s*,?\s*/i;
    const hasWake = wakeWords.test(transcript);
    if (hasWake) {
      console.log("WAKE_WORD_DETECTED");
    }

    // Is Prompt Listening Mode active?
    const isPromptMode = isFollowUpRef.current || hasAskedNavigationQuestionRef.current;

    // Wake Listening Mode requires the wake word ONLY IF we are not already in an active session
    if (!isPromptMode && !isVoiceEngineActivatedRef.current) {
      if (!hasWake) {
        console.log("[STT Wake Mode] Ignored command without wake word in Wake Listening Mode:", transcript);
        setSpeechFeedback("Roamie is asleep. Say 'Hey Roamie' to command.");
        return;
      }
    }

    // Strip wake word
    if (hasWake) {
      transcript = transcript.replace(wakeWords, '').replace(/^,\s*/, '').trim();
    }

    // If they just said "Hey Roamie" to wake her up/confirm presence without a command
    if (!transcript) {
      speakText("Yes, I'm listening. Where would you like to go?", undefined, 'listening');
      setSpeechFeedback("Roamie is listening...");
      return;
    }

    // Reset prompt follow-up state since we're processing an active command
    isFollowUpRef.current = false;

    console.log("Speech captured");
    console.log(`[STT] Command: "${transcript}"`);
    setSpeechFeedback(`Command parsed: "${transcript}"`);

    // GPS COMMAND INTENT BEHAVIOR DETECTION
    const isGPSCommand = transcript.includes('navigate') || 
                          transcript.includes('gps') || 
                          transcript.includes('take me to') || 
                          transcript.includes('take us to') || 
                          transcript.includes('go to') || 
                          transcript.includes('where is the nearest') || 
                          transcript.includes('find nearby') || 
                          transcript.includes('find the nearest') ||
                          transcript.includes('nearest') ||
                          transcript.includes('find gas') ||
                          transcript.includes('find coffee') ||
                          transcript.includes('get coffee');

    if (activeLoc) {
      if (isNavigateAction) {
        lastSuggestedLocationRef.current = null;
        const currentTrip = trips.find(t => t.tripId === activeTripId) || trips[0];
        setTrips(prev => prev.map(t => {
          if (t.tripId === currentTrip.tripId) {
            return {
              ...t,
              savedIdeas: [...t.savedIdeas, { text: `GPS Handoff: ${activeLoc.name}`, createdAt: Date.now() }]
            };
          }
          return t;
        }));
        speakText(`Okay, initiating navigation to ${activeLoc.name}. Coordinates synced via Bluetooth to your active vehicle navigation.`);
        setTimeout(() => {
          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeLoc.query)}`, '_blank');
        }, 1500);
        return;
      }
      
      if (isAddAction) {
        lastSuggestedLocationRef.current = null;
        const currentTrip = trips.find(t => t.tripId === activeTripId) || trips[0];
        setTrips(prev => prev.map(t => {
          if (t.tripId === currentTrip.tripId) {
            return {
              ...t,
              savedIdeas: [...t.savedIdeas, { text: `GPS Detour: ${activeLoc.name}`, createdAt: Date.now() }]
            };
          }
          return t;
        }));
        speakText(`Understood. Adding ${activeLoc.name} to our route coordinates.`);
        setTimeout(() => {
          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeLoc.query)}`, '_blank');
        }, 1500);
        return;
      }
      
      if (isSkipAction) {
        if (activeLoc) {
          setDeclinedLocations(prev => [...prev, activeLoc.name]);
        }
        lastSuggestedLocationRef.current = null;
        speakText("Understood. Keeping our current route coordinates.");
        return;
      }
    } else {
      if (isNavigateAction || isAddAction) {
        speakText("Certainly. I don't see a current suggested spot yet. Try asking me for search coordinates first, like: find the closest gas station.");
        return;
      }
    }

    if (isGPSCommand) {
      handleSendMessage(undefined, rawTranscript);
      return;
    }

    // GPS Handshake confirmation check (as fallback)
    const affirmatives = ["yes", "yeah", "yep", "sure", "okay", "ok", "add it", "take me there", "navigate there", "start navigation", "please", "go ahead", "send it", "do it", "perfect"];
    const negatives = ["no", "nay", "don't", "dont", "stop", "cancel", "never mind", "nevermind", "no thank you", "no thanks", "not now"];
    
    const matchesWordOrPhrase = (phraseList: string[], text: string) => {
      const tWords = text.toLowerCase().split(/[^\w]+/).filter(Boolean);
      return phraseList.some(phrase => {
        const pWords = phrase.toLowerCase().split(/[^\w]+/).filter(Boolean);
        if (pWords.length === 0) return false;
        for (let i = 0; i <= tWords.length - pWords.length; i++) {
          let match = true;
          for (let j = 0; j < pWords.length; j++) {
            if (tWords[i + j] !== pWords[j]) {
              match = false;
              break;
            }
          }
          if (match) return true;
        }
        return false;
      });
    };

    const matchesAffirmative = matchesWordOrPhrase(affirmatives, transcript);
    const matchesNegative = matchesWordOrPhrase(negatives, transcript);

    if (hasAskedNavigationQuestionRef.current && !matchesAffirmative && !matchesNegative && !isNavigateAction && !isAddAction && !isSkipAction) {
      console.log("[STT Prompt] Resetting navigation question ref because user switched context to:", transcript);
      hasAskedNavigationQuestionRef.current = false;
    }
    
    if (hasAskedNavigationQuestionRef.current) {
      hasAskedNavigationQuestionRef.current = false;
      if (matchesAffirmative) {
        if (activeLoc) {
          speakText("Navigation has started.");
          
          setActiveRouteTarget({
            label: activeLoc.name,
            query: activeLoc.query
          });
          setIsSimulatedRoutingActive(true);
          setSimulatedDistance(5.0);
          
          const currentTrip = trips.find(t => t.tripId === activeTripId) || trips[0];
          setTrips(prev => prev.map(t => {
            if (t.tripId === currentTrip.tripId) {
              return {
                ...t,
                savedIdeas: [...t.savedIdeas, { text: `GPS Handoff: ${activeLoc.name}`, createdAt: Date.now() }]
              };
            }
            return t;
          }));
          
          launchDeviceNavigation(activeLoc.name, activeLoc.query);
        } else {
          speakText("I found the destination, but I didn't have coordinates ready.");
        }
        return;
      } else if (matchesNegative) {
        speakText("Understood. Keeping our current route coordinates.");
        return;
      }
    }

    if (activeLoc) {
      if (matchesAffirmative) {
        lastSuggestedLocationRef.current = null;
        const currentTrip = trips.find(t => t.tripId === activeTripId) || trips[0];
        setTrips(prev => prev.map(t => {
          if (t.tripId === currentTrip.tripId) {
            return {
              ...t,
              savedIdeas: [...t.savedIdeas, { text: `GPS Handoff: ${activeLoc.name}`, createdAt: Date.now() }]
            };
          }
          return t;
        }));
        speakText(`Okay, adding it to your route now. Transferring ${activeLoc.name} coordinates to vehicle navigation.`);
        setTimeout(() => {
          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeLoc.query)}`, '_blank');
        }, 1500);
        return;
      } else if (matchesNegative) {
        lastSuggestedLocationRef.current = null;
        speakText("Understood. Keeping our current route coordinates.");
        return;
      }
    }

    // Core music & secondary commands
    if (transcript === 'play music' || transcript === 'play road trip music' || transcript === 'start music' || transcript === 'play road trip playlist') {
      speakText(`Understood ${activeUserRef.current}. Launching official Amazon Music Gateway Folk playlist on your mobile application. Sound stream active via Bluetooth.`);
      window.open('https://music.amazon.com/playlists/B07HG67H88', '_blank');
    } else if (transcript.startsWith('play ')) {
      const titleSearch = transcript.substring(5).trim();
      if (titleSearch.toLowerCase().includes('whispering pines') || titleSearch.toLowerCase().includes('whispering') || titleSearch.toLowerCase().includes('pines')) {
        speakText(`Certainly ${activeUserRef.current}. Launching the Whispering Pines playlist on Amazon Music application.`);
        window.open('https://music.amazon.com/playlists/B01M9I23UP', '_blank');
      } else if (titleSearch.toLowerCase().includes('road trip') || titleSearch.toLowerCase().includes('gateway') || titleSearch.toLowerCase().includes('folk')) {
        speakText(`Certainly ${activeUserRef.current}. Opening the Gateway Folk playlist on Amazon Music application.`);
        window.open('https://music.amazon.com/playlists/B07HG67H88', '_blank');
      } else {
        speakText(`Initiating deep-link handoff to Amazon Music for search query "${titleSearch}".`);
        window.open(`https://music.amazon.com/search/${encodeURIComponent(titleSearch)}`, '_blank');
      }
    } else if (transcript === 'pause music' || transcript === 'stop music' || transcript === 'mute music') {
      speakText(`Understood ${activeUserRef.current}. Please use your vehicle steering audio buttons or system notification controls to pause Amazon Music, as it streams externally.`);
    } else if (transcript === 'resume music' || transcript === 'continue music') {
      speakText(`Initiating launch sequence to hand off playback back to Amazon Music application.`);
      window.open('https://music.amazon.com', '_blank');
    } else if (transcript === 'next song' || transcript === 'skip song' || transcript === 'switch song' || transcript === 'skip music') {
      speakText(`Please use vehicle controls or the Amazon Music overlay screen to skip tracks, since Amazon handles audio handoffs externally.`);
    } else if (transcript.includes('save this memory') || transcript.includes('save memory') || transcript.includes('add a memory') || transcript.includes('add memory') || transcript.includes('snapshot')) {
      const id = generateId();
      const newMem = {
        id,
        url: '/src/assets/images/roamie_avatar_v4_1779827755840.png',
        caption: `Hands-free voice travel snapshot saved near Onslow Mountain as ${activeUserRef.current}`,
        addedBy: activeUserRef.current as any,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setPhotos(prev => [newMem, ...prev]);
      speakText(`Memory saved. Picture secure on Rhonda and Susan's travel board.`);
    } else if (transcript.includes('save voice note') || transcript.includes('save note') || transcript.includes('save voice') || transcript.includes('voice diary')) {
      const id = generateId();
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const recordText = `Hands-free voice note recorded near Onslow: "Tranquil drive along forest pathways with beautiful melodies"`;
      setJournals(prev => [
        { id, text: recordText, date: dateStr, author: activeUserRef.current as any },
        ...prev
      ]);
      speakText(`Excellent. Voice note logged and signed by ${activeUserRef.current} in your travel diary.`);
    } else if (transcript.includes('mute roamie') || transcript.includes('mute assistant')) {
      setProfile(prev => ({ ...prev, settings: { ...prev.settings, responseMode: 'text' } }));
      speakText(`Understood. Remaining silent so you can enjoy the drive.`);
    } else if (transcript.includes('unmute roamie') || transcript.includes('unmute assistant')) {
      setProfile(prev => ({ ...prev, settings: { ...prev.settings, responseMode: 'combined' } }));
      setTimeout(() => {
        speakText("Vocalization restored. I am here with you, hands-free.");
      }, 100);
    } else {
      // Direct message fallback logic - send CLEANED transcript to handleSendMessage
      handleSendMessage(undefined, transcript);
    }
  };

  const isSelfVoice = (transcript: string, spokenText: string): boolean => {
    if (!spokenText || !isSpeakingRef.current) return false;
    
    const cleanSpoken = spokenText.toLowerCase().replace(/[.,?!;:()'"]/g, ' ');
    const cleanTranscript = transcript.toLowerCase().replace(/[.,?!;:()'"]/g, ' ');
    
    // Very short overlap checks for common Roamie phrases
    if (cleanTranscript.length < 15 && cleanSpoken.includes(cleanTranscript)) {
      return true;
    }

    const spokenWords = cleanSpoken.split(/\s+/).filter(w => w.length >= 2);
    const transcriptWords = cleanTranscript.split(/\s+/).filter(w => w.length >= 2);
    
    if (transcriptWords.length === 0) return false;
    
    let matchesCount = 0;
    for (const tw of transcriptWords) {
      if (spokenWords.includes(tw)) {
        matchesCount++;
      }
    }
    
    const matchRatio = matchesCount / transcriptWords.length;
    // Lowered threshold for self-voice detection to 70% to be safer against environment echo
    return matchRatio >= 0.70;
  };

  const handleDirectCommandDuringSpeech = (transcript: string): boolean => {
    const rawLower = transcript.toLowerCase();
    
    // Check navigation/trip intent
    const hasNavIntent = rawLower.includes("add") || 
                         rawLower.includes("navigate") || 
                         rawLower.includes("gps") || 
                         rawLower.includes("route") || 
                         rawLower.includes("take me") || 
                         rawLower.includes("take us") ||
                         rawLower.includes("go to") ||
                         rawLower.includes("directions");
    
    if (!hasNavIntent) return false;

    // Gather candidate places
    const candidates: string[] = [];

    // 1. Gather from suggestedPois state if present
    if (suggestedPois) {
      if (suggestedPois.closestOnRoute?.name) {
        candidates.push(suggestedPois.closestOnRoute.name);
      }
      if (suggestedPois.nextClosest) {
        candidates.push(suggestedPois.nextClosest);
      }
      if (suggestedPois.otherOptions) {
        for (const opt of suggestedPois.otherOptions) {
          if (opt && opt !== "Option 3" && opt !== "Option 2" && opt !== "Option 1") {
            candidates.push(opt);
          }
        }
      }
    }

    // 2. Gather from currentSpokenTextRef.current
    const spoken = currentSpokenTextRef.current;
    if (spoken) {
      // Named list items / numbered items
      const numberedRegex = /(?:\d+[\s.:)+-]+)\s*([A-Za-z0-9'\s&-]{2,40})/g;
      let m;
      while ((m = numberedRegex.exec(spoken)) !== null) {
        if (m[1]) {
          const name = m[1].trim();
          if (name && !candidates.includes(name)) {
            candidates.push(name);
          }
        }
      }
      // Look for known places
      const commonPlaces = [
        "Lavender Beans Bistro", "Highway Brews Express", "Tim Hortons", "Starbucks Corridor Shop",
        "Mass Down Café", "Sunrise Coffee", "Harbour Brew", "Onslow Fuel Stop", "Irving Oil Station", "Irving Oil",
        "Woodland Diner", "The Maple Table", "Ocean Breeze Dine", "Village Green Foods", "Flo EV Charging Station",
        "Flo EV Station", "SafeMed Pharmacy", "Shoppers Drug Mart", "Community Book House", "Onslow Public Library",
        "Whispering Pines Trail", "Cobequid Hill Path", "Shubie River Beach", "Sands Cove Area", "Spruce Woods Campsite",
        "Red Maple Campground", "EcoVolt Fast Charger", "The Cozy Rest Lodge", "Spruce Corridor Inn",
        "Colchester Regional Hospital", "Onslow Emergency Care"
      ];
      for (const cp of commonPlaces) {
        if (spoken.toLowerCase().includes(cp.toLowerCase()) && !candidates.includes(cp)) {
          candidates.push(cp);
        }
      }
    }

    if (candidates.length === 0) {
      const commonPlaces = [
        "Lavender Beans Bistro", "Highway Brews Express", "Tim Hortons", "Starbucks Corridor Shop",
        "Mass Down Café", "Sunrise Coffee", "Harbour Brew", "Onslow Fuel Stop", "Irving Oil Station", "Irving Oil",
        "Woodland Diner", "The Maple Table", "Ocean Breeze Dine", "Village Green Foods", "Flo EV Charging Station",
        "Flo EV Station", "SafeMed Pharmacy", "Shoppers Drug Mart", "Community Book House", "Onslow Public Library",
        "Whispering Pines Trail", "Cobequid Hill Path", "Shubie River Beach", "Sands Cove Area", "Spruce Woods Campsite",
        "Red Maple Campground", "EcoVolt Fast Charger", "The Cozy Rest Lodge", "Spruce Corridor Inn",
        "Colchester Regional Hospital", "Onslow Emergency Care"
      ];
      for (const cp of commonPlaces) {
        if (rawLower.includes(cp.toLowerCase())) {
          candidates.push(cp);
        }
      }
    }

    console.log("[STT Prompt] Candidates for command injection:", candidates);

    // Filter out stop words from transcript to see if they name any candidate
    const stopwords = [
      "add to my gps", "add to gps", "add to route", "add to my route", "add to trip", "add to my trip", 
      "add options", "add option", "add it", "add", "navigate to", "navigate there", "navigate", 
      "take me there", "take me to", "take us to", "take us there", "go to", "can you add", 
      "to my gps", "to gps", "to route", "to my route", "to trip", "to my trip", "to the gps", "to directions", "please", "my gps", "gps", "route", "trip", "highway"
    ];
    
    let coreQuery = rawLower;
    for (const sw of stopwords) {
      const regex = new RegExp(`\\b${sw}\\b`, 'gi');
      coreQuery = coreQuery.replace(regex, ' ');
    }
    coreQuery = coreQuery.replace(/[.,?!]/g, ' ').replace(/\s+/g, ' ').trim();

    if (!coreQuery || coreQuery.length < 2) return false;

    console.log("[STT Prompt] Extracted core query:", coreQuery);

    let matchedCandidate = "";
    // Step A: Precise Substring/Inclusion match
    for (const cand of candidates) {
      const candLower = cand.toLowerCase();
      if (candLower.includes(coreQuery) || coreQuery.includes(candLower)) {
        matchedCandidate = cand;
        break;
      }
    }

    // Step B: Multi-word match
    if (!matchedCandidate) {
      const coreWords = coreQuery.split(/\s+/).filter(w => w.length > 2);
      if (coreWords.length > 0) {
        for (const cand of candidates) {
          const candLower = cand.toLowerCase();
          const matchesAllWords = coreWords.every(w => candLower.includes(w));
          if (matchesAllWords) {
            matchedCandidate = cand;
            break;
          }
        }
        if (!matchedCandidate) {
          for (const cand of candidates) {
            const candLower = cand.toLowerCase();
            const matchesAnyWord = coreWords.some(w => candLower.includes(w));
            if (matchesAnyWord) {
              matchedCandidate = cand;
              break;
            }
          }
        }
      }
    }

    if (matchedCandidate) {
      console.log("[STT Direct Handoff] MATCHED candidate place:", matchedCandidate);
      
      if (typeof fireAssistantEvent === 'function') {
        fireAssistantEvent('NAVIGATION_REQUESTED');
      }

      // Stop speech synthesis instantly
      safeCancelSpeech();
      isSpeakingRef.current = false;

      const actionType = rawLower.includes("add") ? "adding to route" : "initiating navigation";
      const confirmationText = actionType === "adding to route"
        ? `Understood. Adding ${matchedCandidate} to our route coordinates.`
        : `Okay, initiating navigation to ${matchedCandidate}. Coordinates synced via Bluetooth to your active vehicle navigation.`;
      
      transitionToState('idle');
      setSpeechFeedback(`Direct Command Executed: "${matchedCandidate}"`);
      
      speakText(confirmationText, undefined, 'idle');
      
      if (typeof fireAssistantEvent === 'function') {
        fireAssistantEvent('NAVIGATION_STARTED');
      }

      setActiveRouteTarget({
        label: matchedCandidate,
        query: `${matchedCandidate}, Nova Scotia`
      });
      setIsSimulatedRoutingActive(true);
      setSimulatedDistance(5.0);

      const currentTrip = trips.find(t => t.tripId === activeTripId) || trips[0];
      setTrips(prev => prev.map(t => {
        if (t.tripId === currentTrip.tripId) {
          return {
            ...t,
            savedIdeas: [...t.savedIdeas, { text: `GPS Handoff: ${matchedCandidate}`, createdAt: Date.now() }]
          };
        }
        return t;
      }));

      setTimeout(() => {
        launchDeviceNavigation(matchedCandidate, `${matchedCandidate}, Nova Scotia`);
      }, 1500);

      return true;
    }

    return false;
  };

  // Web Speech API STT initialisation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        console.log("[VOICE_PIPELINE] Microphone active. Speech recognition session started.");
        setIsListening(true);
        isSpeechRecognitionActiveRef.current = true;
        lastErrorRef.current = null;
        setSpeechFeedback("Roamie is listening carefully...");
      };

      rec.onresult = (event: any) => {
        const now = Date.now();
        if (now - lastProcessedTimeRef.current < 800) {
          console.log("[STT] Ignored rapid voice recognition callback (lockout active)");
          return;
        }

        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            interimTranscript += trans;
          }
        }

        const currentTranscript = (finalTranscript || interimTranscript).trim();
        if (!currentTranscript) return;

        console.log(`[VOICE_PIPELINE] Capture: "${currentTranscript}" (isFinal: ${!!finalTranscript})`);

        const transcriptLower = currentTranscript.toLowerCase();

        // 1. TRUE REAL-TIME INTERRUPT SYSTEM
        const isSpeakingOrResponding = roamieStateRef.current === 'processing' || roamieStateRef.current === 'speaking' || isSpeakingRef.current;
        
        // Prevent self-voice feedback from triggering false interrupts
        if (isSpeakingOrResponding && isSelfVoice(currentTranscript, currentSpokenTextRef.current)) {
          console.log("[STT Filter] Ignored self-voice capture during active speech synthesis:", currentTranscript);
          return;
        }

        // Interrupt phrases: "hey roamie", "stop roamie", "thank you roamie", "yes", "no", "navigate there", "add it to my trip" etc.
        const interruptPhrases = [
          "hey roamie", "hey romy", "ok roamie", "ok romy", "roamie", "romy",
          "stop roamie", "stop romy", "thank you roamie", "thank you romy", "thank you", "thanks",
          "yes", "yeah", "yep", "sure", "okay", "ok", "no", "not now", "cancel", "never mind", "nevermind",
          "navigate there", "add it", "take me there", "add to route", "start navigation",
          "do it", "yes please", "go ahead", "please", "no thanks", "skip", "add to gps", "navigate to it", "take us there", "add this", "route there"
        ];

        if (isSpeakingOrResponding) {
          // Check for direct command injection (e.g. "Add Mass Down to my GPS")
          const didExecuteDirect = handleDirectCommandDuringSpeech(currentTranscript);
          if (didExecuteDirect) {
            console.log("[STT Interrupt] Direct command executed during active speech. Aborting further STT loop.");
            try {
              rec.abort();
            } catch (e) {}
            isSpeechRecognitionActiveRef.current = false;
            setIsListening(false);
            return;
          }

          // ONLY interrupt if the voice capture contains an actual interrupt phrase OR is a substantial phrase of >= 12 characters.
          // This prevents background vehicle cabin noise or silent breathing from cutting off Roamie mid-sentence.
          const isIntentionalInterrupt = interruptPhrases.some(phrase => transcriptLower.includes(phrase)) || transcriptLower.length >= 12;
          
          if (!isIntentionalInterrupt) {
            console.log("[STT Filter] Ignored background noise / breathing capture during speech/processing:", transcriptLower);
            return;
          }
        }

        if (isSpeakingOrResponding) {
          console.log("[STT Interrupt] Intercepted voice speaking/processing via deliberate user speech:", transcriptLower);
          lastProcessedTimeRef.current = now;
          
          // Stop speech synthesis immediately
          safeCancelSpeech();
          isSpeakingRef.current = false;
          
          // Transition to listening instantly so we can catch her follow-up prompt responses
          transitionToState('listening');
          setSpeechFeedback("Interrupted. Listening...");
          
          isFollowUpRef.current = true;

          if (finalTranscript) {
            try {
              rec.abort();
            } catch (e) {}
            isSpeechRecognitionActiveRef.current = false;
            setIsListening(false);
            
            setTimeout(() => {
              handleVoiceCommand(finalTranscript);
            }, 50);
            return;
          }
          return;
        }

        // Thank you/Stop/Shutdown logic (ALWAYS INTERRUPT AND SHUTDOWN VOICE SESSION)
        const isThanksPhrase = transcriptLower.includes('thank you roamie') ||
                               transcriptLower.includes('thank you romy') ||
                               transcriptLower.includes('thanks roamie') ||
                               transcriptLower.includes('thanks romy') ||
                               transcriptLower === 'thank you' ||
                               transcriptLower === 'thanks';

        const isStopPhrase = transcriptLower === 'stop' ||
                             transcriptLower === 'cancel' ||
                             transcriptLower === 'pause' ||
                             transcriptLower === 'shutup' ||
                             transcriptLower === 'shut up' ||
                             transcriptLower === 'be quiet' ||
                             isThanksPhrase ||
                             transcriptLower.includes('never mind') ||
                             transcriptLower.includes('nevermind');

        if (isThanksPhrase || (isSpeakingOrResponding && isStopPhrase)) {
          console.log("[STT] Intercepted stop / thank you command. Shutting down voice engine.", currentTranscript);
          lastProcessedTimeRef.current = now;
          safeCancelSpeech();
          setIsVoiceEngineActivated(false);
          isVoiceEngineActivatedRef.current = false;
          safeStopRecognition();
          transitionToState('idle');
          setSpeakingMsgId(null);
          isSpeakingRef.current = false;
          setSpeechFeedback("Roamie closed the microphone and went to sleep.");
          try {
            rec.abort();
          } catch (e) {}
          return;
        }

        // Reset or extend silence timer because the user is active/speaking!
        if (roamieStateRef.current === 'listening') {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          const silenceDuration = (isFollowUpRef.current || hasAskedNavigationQuestionRef.current) ? 15000 : 8000;
          silenceTimerRef.current = setTimeout(() => {
            if (roamieStateRef.current === 'listening') {
              console.log("[STT] Silence timeout. Transitioning back to sleep state 'idle'.");
              setSpeechFeedback("Roamie is asleep. Say 'Hey Roamie' to wake her.");
              setIsVoiceEngineActivated(false);
              isVoiceEngineActivatedRef.current = false;
              safeStopRecognition();
              transitionToState('idle');
            }
          }, silenceDuration);
        }

        if (finalTranscript) {
          if (roamieStateRef.current === 'listening') {
            console.log("[STT] Processing final transcript in active listening state:", finalTranscript);
            console.log("Speech recognized");
            lastProcessedTimeRef.current = now;
            try {
              rec.abort();
            } catch (e) {}
            isSpeechRecognitionActiveRef.current = false;
            setIsListening(false);

            handleVoiceCommand(finalTranscript);
          } else {
            setChatInputs(prev => ({
              ...prev,
              [activeTripIdRef.current]: finalTranscript
            }));
            setSpeechFeedback(`Voice received: "${finalTranscript}"`);
          }
        }
      };

      rec.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        lastErrorRef.current = event.error;
        if (event.error !== 'no-speech') {
          setSpeechFeedback(`Voice engine note: ${event.error === 'not-allowed' ? 'Access denied' : event.error}. Listening...`);
        }
        setIsListening(false);
        isSpeechRecognitionActiveRef.current = false;
        
        if (event.error === 'not-allowed') {
          setSpeechFeedback("Microphone access is denied. Check permission.");
          setIsVoiceEngineActivated(false);
          isVoiceEngineActivatedRef.current = false;
          transitionToState('idle');
        }
      };

      rec.onend = () => {
        setIsListening(false);
        isSpeechRecognitionActiveRef.current = false;
      };

      recognitionRef.current = rec;

      // Setup Passive Wake-Word Recognition
      if (wakeWordRecognitionRef.current) {
        try {
          wakeWordRecognitionRef.current.abort();
        } catch (e) {}
      }
      const wakeRec = new SpeechRecognition();
      wakeRec.continuous = true;
      wakeRec.interimResults = true;
      wakeRec.lang = 'en-US';

      wakeRec.onstart = () => {
        isWakeWordListeningRef.current = true;
        console.log("[WakeWord] Passive wake-word listener is now active...");
        // Reset error count on successful start
        wakeWordErrorCountRef.current = 0;
      };

      wakeRec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            interimTranscript += trans;
          }
        }

        const currentTranscript = (finalTranscript || interimTranscript).trim().toLowerCase();
        if (!currentTranscript) return;

        const wakeWords = /^(hey\s+rom[yi]|ok\s+rom[yi]|rom[yi]|hey\s+roamie|ok\s+roamie|roamie)/i;
        const match = currentTranscript.match(wakeWords);
        if (match) {
          console.log("Wake word detected");
          console.log("WAKE_WORD_DETECTED");
          console.log("[WakeWord] Wake word detected passively:", currentTranscript);

          const matchedPhrase = match[0];
          let remainder = currentTranscript.substring((match.index || 0) + matchedPhrase.length).replace(/^[\s,.;:?!]+|[\s,.;:?!]+$/g, '').trim();

          // Mark as not listening before aborting to avoid loop
          isWakeWordListeningRef.current = false;
          try {
            lastWakeWordAbortTimeRef.current = Date.now();
            wakeRec.abort();
          } catch (e) {}

          if (remainder.length > 1) {
            console.log("Speech recognized");
            playToneAndStartActiveVoiceSession();
            setTimeout(() => {
              handleVoiceCommand(remainder);
            }, 350);
          } else {
            document.dispatchEvent(new CustomEvent('VOICE_ENGINE_WAKE'));
            playToneAndStartActiveVoiceSession();
          }
        }
      };

      wakeRec.onerror = (event: any) => {
        if (event.error === 'aborted') {
          console.log("[WakeWord] Passive recognition aborted (likely handover or system preempted).");
        } else {
          console.warn("Wake-word passive recognition error:", event.error);
          wakeWordErrorCountRef.current++;
        }
        
        if (event.error === 'not-allowed') {
          isWakeWordListeningRef.current = false;
        }
      };

      wakeRec.onend = () => {
        isWakeWordListeningRef.current = false;
        console.log("[WakeWord] onend event triggered.");
        
        // Auto-restart passive wake word listener if not in active session
        // Throttled and condition-aware restart
        if (!isSpeechRecognitionActiveRef.current && roamieStateRef.current === 'idle' && !isVoiceEngineActivatedRef.current && !isSpeakingRef.current) {
          // If we see too many errors, use a longer backoff (up to 30s)
          const backoff = Math.min(3000 * wakeWordErrorCountRef.current, 30000);
          const delay = 1000 + backoff;
          
          if (wakeWordRestartTimeoutRef.current) clearTimeout(wakeWordRestartTimeoutRef.current);
          wakeWordRestartTimeoutRef.current = setTimeout(() => {
            if (!isSpeechRecognitionActiveRef.current && roamieStateRef.current === 'idle' && !isVoiceEngineActivatedRef.current && !isSpeakingRef.current) {
              startPassiveWakeWordListener();
            }
          }, delay);
        } else {
          console.log("[WakeWord] Skipping auto-restart due to active conversation or speaking state.");
        }
      };

      wakeWordRecognitionRef.current = wakeRec;

      return () => {
        try {
          rec.abort();
        } catch (e) {}
        try {
          wakeRec.abort();
        } catch (e) {}
        isSpeechRecognitionActiveRef.current = false;
        isWakeWordListeningRef.current = false;
        recognitionRef.current = null;
        wakeWordRecognitionRef.current = null;
      };
    }
  }, []);

  // Handle auto-starting/stopping recognition when entering/exiting Driving Mode screen or picking Voice/Combined preferences
  useEffect(() => {
    // Microphone is completely OFF and Speech Recognition is NOT active in IDLE state
    transitionToState('idle');
  }, [activeScreen, profile.settings.responseMode]);

  // Handle auto scrolling on chats
  useEffect(() => {
    if (activeScreen === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, activeScreen, isTyping]);

  // Clean comfort vocalization engine
  const speakText = (text: string, msgId?: string, forceNextState?: 'idle' | 'listening') => {
    if (!window.speechSynthesis) {
      setSpeechFeedback("Speech Synthesis is currently blocked.");
      return;
    }

    // Intercept and append the action prompt if it's a location suggestion
    let finalText = text;
    const textLower = text.toLowerCase();
    const isNavigationOffer = (textLower.includes("gps") || textLower.includes("directions") || textLower.includes("navigate") || textLower.includes("route") || textLower.includes("map") || textLower.includes("take you") || textLower.includes("closest on your route") || textLower.includes("closest on route")) &&
                              !(textLower.includes("stay on") || textLower.includes("keep") || textLower.includes("original") || textLower.includes("holding course") || textLower.includes("cancel") || textLower.includes("under-stood") || textLower.includes("understood") || textLower.includes("stay with") || textLower.includes("keep route") || textLower.includes("stay on the current"));
    const containsOffer = (textLower.includes("would you like") || textLower.includes("want me to") || textLower.includes("should i") || textLower.includes("want directions") || textLower.includes("shall i") || textLower.includes("shall we") || textLower.includes("want directions?")) &&
                          !(textLower.includes("stay on") || textLower.includes("keep") || textLower.includes("original") || textLower.includes("holding course") || textLower.includes("cancel") || textLower.includes("under-stood") || textLower.includes("understood") || textLower.includes("stay with") || textLower.includes("keep route") || textLower.includes("stay on the current"));
    const actionPrompt = "Would you like me to navigate there?";
    const alreadyAppended = textLower.includes("would you like me to navigate there");
    
    if ((isNavigationOffer || containsOffer) && !alreadyAppended) {
      let trimmed = text.trim();
      if (!trimmed.endsWith("?") && !trimmed.endsWith(".")) {
        trimmed += ".";
      }
      finalText = trimmed + " " + actionPrompt;

      // Update the chat message inside chats log immediately so user sees and hears the exact same synchronous prompt
      if (msgId) {
        setChats(prev => {
          const tripId = activeTripIdRef.current || activeTripId;
          const existing = prev[tripId];
          if (!existing) return prev;
          const updatedMsgs = existing.messages.map(m => {
            if (m.id === msgId && !m.content.toLowerCase().includes("would you like me to navigate there")) {
              let contentTrimmed = m.content.trim();
              if (!contentTrimmed.endsWith("?") && !contentTrimmed.endsWith(".")) {
                contentTrimmed += ".";
              }
              return { ...m, content: contentTrimmed + " " + actionPrompt };
            }
            return m;
          });
          return {
            ...prev,
            [tripId]: {
              ...existing,
              messages: updatedMsgs
            }
          };
        });
      }
    }

    const finalLower = finalText.toLowerCase();

    // Determine if the response contains a question, demanding dynamic voice follow-up listening
    const isQuestion = (finalText.trim().endsWith('?') || 
                        finalLower.includes('would you like') || 
                        finalLower.includes('do you want') ||
                        finalLower.includes('want directions') ||
                        finalLower.includes('should i') || 
                        finalLower.includes('what do you think') ||
                        finalLower.includes('tell me') ||
                        finalLower.includes('any thoughts') ||
                        finalLower.includes('can i help') ||
                        finalLower.includes('how can i help')) &&
                       !(finalLower.includes("stay on") || finalLower.includes("keep") || finalLower.includes("original") || finalLower.includes("holding course") || finalLower.includes("cancel"));

    // After spoken response finishes, transit to the requested force state or default to dynamic listener/idle
    if (forceNextState) {
      nextStateAfterSpeechRef.current = forceNextState;
    } else if (isQuestion) {
      nextStateAfterSpeechRef.current = 'listening';
      hasAskedNavigationQuestionRef.current = true;
      isFollowUpRef.current = true;
    } else {
      nextStateAfterSpeechRef.current = 'idle';
    }

    // Set navigation question tracking flag
    const isNavQuestion = isNavigationOffer && (containsOffer || finalLower.includes("?") || finalLower.includes("navigate there"));
    if (isNavQuestion) {
      hasAskedNavigationQuestionRef.current = true;
    }

    if (isNavigationOffer || containsOffer) {
      let placeName = "";
      if (finalLower.includes("closest on your route:")) {
        const afterPrefix = finalText.split(/(?:closest on your route:)/i)[1].trim();
        const line = afterPrefix.split("\n")[0].trim();
        if (line.includes("(")) {
          placeName = line.split("(")[0].trim();
        } else {
          placeName = line;
        }
      } else if (finalText.includes(" — ")) {
        placeName = finalText.split(" — ")[0].trim();
      } else if (finalText.includes(" - ")) {
        placeName = finalText.split(" - ")[0].trim();
      } else if (finalText.includes("–")) {
        placeName = finalText.split("–")[0].trim();
      } else {
        const commonPlaces = [
          "Lavender Beans Bistro", "Tim Hortons", "Starbucks", 
          "Onslow Fuel Stop", "Irving Oil Station", "Irving Oil",
          "Woodland Diner", "The Maple Table", "Ocean Breeze Dine",
          "Village Green Foods", "Flo EV Charging Station", "Flo EV Station",
          "SafeMed Pharmacy", "Shoppers Drug Mart", "Community Book House",
          "Onslow Public Library", "Whispering Pines Trail", "Cobequid Hill Path",
          "Shubie River Beach", "Sands Cove Area", "Spruce Woods Campsite",
          "Red Maple Campground", "EcoVolt Fast Charger", "The Cozy Rest Lodge",
          "Spruce Corridor Inn", "Colchester Regional Hospital", "Onslow Emergency Care"
        ];
        const foundPlace = commonPlaces.find(p => finalLower.includes(p.toLowerCase()));
        if (foundPlace) {
          placeName = foundPlace;
        } else {
          const matchedLabel = finalText.match(/(?:nearest|closest|find|is|of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
          if (matchedLabel && matchedLabel[1]) {
            placeName = matchedLabel[1].trim();
          } else {
            const firstPart = finalText.replace(/^(the closest|the nearest|a nearby)\s+/i, '').split(/[.,?!;]/)[0].trim();
            placeName = firstPart;
          }
        }
      }
      
      if (placeName && placeName.length < 100) {
        lastSuggestedLocationRef.current = {
          name: placeName,
          query: `${placeName}, Nova Scotia`,
          info: finalText
        };
      }
    }

    // Stop listening and set state to speaking to prevent overlapping loops
    transitionToState('speaking');

    // Cleanly cancel previous speech synthesis and clear callbacks to prevent overlapping runs or stale restarts
    safeCancelSpeech();

    // If muted or text mode, do not speak, but transition to idle state
    if (profile.settings.responseMode === 'text') {
      setSpeakingMsgId(null);
      setTimeout(() => {
        transitionToState('idle');
      }, 500);
      return;
    }

    const cleanText = finalText
      .replace(/[*#_\\-]/g, ' ')
      .replace(/[\n\r]+/g, ' . ')
      .trim();

    currentSpokenTextRef.current = cleanText;

    if (!cleanText) {
      transitionToState('idle');
      return;
    }

    // Delay speaking by 50ms to guarantee speech cancellation flushed successfully
    setTimeout(() => {
      if (roamieStateRef.current !== 'speaking') return;

      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        const rawVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
        let voices = (rawVoices && rawVoices.length > 0) ? rawVoices : availableVoices;
        
        let bestVoice = getRoamieVoice(voices);
        
        // If still not found, try to force-fetch voices again
        if (!bestVoice && window.speechSynthesis) {
          const reFetched = window.speechSynthesis.getVoices();
          if (reFetched && reFetched.length > 0) {
            bestVoice = getRoamieVoice(reFetched);
          }
        }

        if (!bestVoice) {
          console.error("[TTS Engine] Correct Roamie voice is currently unavailable (no elegant/female English voice). Failing silently to comply with locks.");
          // Fail silently and transition cleanly to next state or idle!
          setSpeakingMsgId(null);
          isSpeakingRef.current = false;
          transitionToState(nextStateAfterSpeechRef.current);
          return;
        }

        // Hard-bind Roamie voice on EVERY response
        utterance.voice = bestVoice;
        utterance.rate = 0.90; // Natural pacing
        utterance.pitch = 1.0;

        console.log(`[VOICE_PIPELINE] TTS started: "${cleanText.substring(0, 50)}..."`);
        utterance.onstart = () => {
          console.log("[VOICE_PIPELINE] Voice playback audible on hardware device.");
          setSpeakingMsgId(msgId || 'auto');
          isSpeakingRef.current = true;
        };

        utterance.onend = () => {
          if (activeUtteranceRef.current === utterance) {
            console.log("TTS_COMPLETED");
            setSpeakingMsgId(null);
            isSpeakingRef.current = false;
            // After reply finishes, transition to target post-speech state!
            transitionToState(nextStateAfterSpeechRef.current);
          }
        };

        utterance.onerror = (e) => {
          console.warn("[TTS Error]", e);
          if (activeUtteranceRef.current === utterance) {
            setSpeakingMsgId(null);
            isSpeakingRef.current = false;
            // Transition to target post-speech state even on error!
            transitionToState(nextStateAfterSpeechRef.current);
          }
        };

        activeUtteranceRef.current = utterance;

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        console.log("TTS initiated");
        window.speechSynthesis.speak(utterance);
        isSpeakingRef.current = true;
      } catch (e) {
        console.error(e);
        // Fallback transition to idle
        transitionToState('idle');
      }
    }, 50);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      console.warn("Voice speech recognition is not supported in this browser perspective.");
      return;
    }

    if (!isVoiceEngineActivatedRef.current) {
      setIsVoiceEngineActivated(true);
      isVoiceEngineActivatedRef.current = true;
      transitionToState('listening');
      speakText("Yes, I'm listening.", undefined, 'listening');
    } else {
      if (roamieStateRef.current === 'idle') {
        transitionToState('listening');
        speakText("Yes, I'm listening.", undefined, 'listening');
      } else {
        setIsVoiceEngineActivated(false);
        isVoiceEngineActivatedRef.current = false;
        safeStopRecognition();
        transitionToState('idle');
      }
    }
  };

  // Switch Active User Toggle
  const handleUserToggle = (user: 'Rhonda' | 'Susan') => {
    setActiveUser(user);
    
    // Add logs
    const currentList = chats[activeTripId]?.messages || [];
    const newMsg: ChatLogMessage = {
      id: generateId(),
      role: 'user',
      type: 'text',
      content: `[System]: Switched pen to ${user}.`,
      timestamp: Date.now(),
      senderName: user
    };

    updateChatMessages(activeTripId, [...currentList, newMsg]);
  };

  const updateChatMessages = (tripId: string, msgs: ChatLogMessage[]) => {
    setChats(prev => {
      const existing = prev[tripId] || { chatId: `chat-${tripId}`, tripId, userId: profile.userId, messages: [] };
      return {
        ...prev,
        [tripId]: {
          ...existing,
          messages: msgs
        }
      };
    });
  };

  // Dispatch Chat Dialogues
  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || chatInputs[activeTripId]?.trim() || '';
    if (!query && !attachedImage) return;

    setDebugLatestUserSaid(query || "Uploaded picture.");
    setDebugLatestSentToAI(query || "Uploaded picture.");
    let detectedInt = "Conversational Query";
    const qLower = (query || "").toLowerCase();
    if (qLower.includes("weather") || qLower.includes("forecast") || qLower.includes("temp")) {
      detectedInt = "Weather Info Inquiry";
    } else if (qLower.includes("coffee") || qLower.includes("gas") || qLower.includes("food") || qLower.includes("eat") || qLower.includes("restaurant") || qLower.includes("pit stop") || qLower.includes("rest stop") || qLower.includes("hiking") || qLower.includes("attraction")) {
      detectedInt = "POI Search Discovery";
    } else if (qLower.includes("navigate") || qLower.includes("gps") || qLower.includes("take me") || qLower.includes("take us") || qLower.includes("go to")) {
      detectedInt = "GPS Navigation Request";
    } else if (qLower.includes("play") || qLower.includes("music") || qLower.includes("song") || qLower.includes("playlist")) {
      detectedInt = "Voice Music Stream Handoff";
    }
    setDebugLatestIntent(detectedInt);

    // Reset feedback
    setSpeechFeedback(null);

    const activeTrip = trips.find(t => t.tripId === activeTripId);
    const destination = activeTrip?.destination || 'ottawa';

    const currentMsgs = chats[activeTripId]?.messages || [];
    
    const userMsgId = generateId();
    const userMessage: ChatLogMessage = {
      id: userMsgId,
      role: 'user',
      type: 'text',
      content: query || "Uploaded a slow trip memory picture.",
      timestamp: Date.now(),
      senderName: activeUser,
      photoUrl: attachedImage || undefined
    };

    const queryLower = query.toLowerCase().trim();
    const wakeWords = /^(hey\s+rom[yi]|ok\s+rom[yi]|rom[yi]|hey\s+roamie|ok\s+roamie|roamie)\s*,?\s*/i;
    const isWake = wakeWords.test(queryLower);
    const isExit = queryLower.includes("thank you roamie") || queryLower.includes("thank you romy") || queryLower.includes("thanks roamie") || queryLower.includes("thanks romy") || queryLower.includes("stop roamie") || queryLower.includes("stop romy") || queryLower === "stop" || queryLower === "thank you" || queryLower === "thanks";

    if (isExit) {
      transitionToState('idle');
      setChatInputs(prev => ({ ...prev, [activeTripId]: '' }));
      const sysMsg: ChatLogMessage = {
        id: generateId(),
        role: 'avatar',
        type: 'text',
        content: "Roamie went to sleep. Say 'Hey Roamie' to wake her.",
        timestamp: Date.now(),
        senderName: 'Roamie'
      };
      updateChatMessages(activeTripId, [...currentMsgs, userMessage, sysMsg]);
      return;
    }

    const cleanedQuery = queryLower.replace(wakeWords, '').trim();
    if (isWake && roamieStateRef.current === 'idle' && !cleanedQuery) {
      transitionToState('listening');
      setChatInputs(prev => ({ ...prev, [activeTripId]: '' }));
      const sysMsg: ChatLogMessage = {
        id: generateId(),
        role: 'avatar',
        type: 'text',
        content: `Yes, I'm listening.`,
        timestamp: Date.now(),
        senderName: 'Roamie'
      };
      updateChatMessages(activeTripId, [...currentMsgs, userMessage, sysMsg]);
      speakText("Yes, I'm listening.", undefined, 'listening');
      return;
    }

    const nextMsgs = [...currentMsgs, userMessage];
    updateChatMessages(activeTripId, nextMsgs);
    setChatInputs(prev => ({ ...prev, [activeTripId]: '' }));
    setAttachedImage(null);
    setIsTyping(true);
    transitionToState('processing');

    console.log("AI_REQUEST_SENT");
    try {
      // Build custom context info for Roamie to hold complete trip memory knowledge
      const tripContextInfo = activeTrip ? {
        title: activeTrip.title,
        destination: activeTrip.destination,
        status: activeTrip.status,
        startDate: activeTrip.startDate,
        endDate: activeTrip.endDate,
        savedIdeasCount: activeTrip.savedIdeas.length,
        itinerarySummary: activeTrip.itinerary.days.map(d => 
          `Day ${d.dayNumber} (${d.date}): ${d.activities.length} schedule blocks`
        ).join(', ')
      } : null;

      // Get accurate current position from browser geolocation
      let lat: number | null = null;
      let lng: number | null = null;
      try {
        if (navigator.geolocation) {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        }
      } catch (geoErr) {
        console.warn("Navigator geolocation turned off or refused:", geoErr);
      }

      console.log(`[VOICE_PIPELINE] API Dispatch: "${query}" (User: ${activeUser})`);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          activePartner: activeUser,
          latitude: lat,
          longitude: lng,
          destination,
          tripContext: tripContextInfo,
          history: currentMsgs.slice(-15).map(m => ({ sender: m.senderName, text: m.content })), // Increased context
          photoData: attachedImage ? attachedImage.split(',')[1] : undefined,
          photoMimeType: attachedImage ? attachedImage.split(',')[0].split(':')[1].split(';')[0] : undefined,
          DRIVING_MODE: activeScreen === 'drive' ? "TRUE" : "FALSE",
          VOICE_ASSISTANCE_MODE: profile.settings.voiceAssistanceMode || 'drive',
          roamingOrigin,
          roamingDestination,
          roamingCurrentPosition
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsTyping(false);
      setIsApiKeyExpiredAlert(false);

      const textReply = data.text || "I am reflecting on our plans.";
      console.log(`AI_RESPONSE_RAW: "${textReply.substring(0, 100)}..."`);
      setDebugLatestAIResponse(textReply);

      // Trigger interactive quick-stop map card if backend returned genuine nearby places
      if (data.places && data.places.length > 0) {
        const mappedResults = data.places.map((p: any) => ({
          name: p.place_name,
          distance: p.distance_km,
          query: p.address || p.place_name,
          lat: p.lat,
          lng: p.lng,
          address: p.address
        }));

        setQuickStopState({
          active: true,
          category: data.place_type || 'Nearby Places',
          results: mappedResults,
          index: 0
        });

        const firstResult = mappedResults[0];
        lastSuggestedLocationRef.current = {
          name: firstResult.name,
          query: firstResult.query,
          info: textReply
        };

        hasAskedNavigationQuestionRef.current = true;
        isFollowUpRef.current = true;
      }

      if (data.intent === 'navigate' && data.destination) {
        setIsSimulatedRoutingActive(true);
        setNavigationErrorTarget(data.destination);
      }

      // Scan response for suggested items we can flag as interactive saving blocks!
      // Like "Try..." or "I suggest..."
      const botMsgId = generateId();
      const botMessage: ChatLogMessage = {
        id: botMsgId,
        role: 'avatar',
        type: 'text',
        content: textReply,
        timestamp: Date.now(),
        senderName: 'Roamie'
      };

      updateChatMessages(activeTripId, [...nextMsgs, botMessage]);

      if (profile.settings.responseMode !== 'text') {
        console.log(`FINAL_TTS_RESPONSE: "${textReply.substring(0, 100)}..."`);
        speakText(textReply, botMsgId);
      } else {
        transitionToState('idle');
      }
    } catch (err: any) {
      setIsTyping(false);
      const fallbackReason = err.message || err;
      console.log(`FALLBACK_TRIGGER_REASON: Frontend: ${fallbackReason}`);
      
      const isRealNetworkError = !navigator.onLine || fallbackReason.toLowerCase().includes("failed to fetch") || fallbackReason.toLowerCase().includes("network");
      
      const textReply = isRealNetworkError 
        ? "It looks like we've lost internet coverage out here in the hills. I'll continue checking our connection!"
        : `I'm sorry, I encountered an error: ${fallbackReason}.`;

      console.log(`FINAL_TTS_RESPONSE: (Error/Fallback) "${textReply}"`);
      const botMsgId = generateId();
      const botMessage: ChatLogMessage = {
        id: botMsgId,
        role: 'avatar',
        type: 'text',
        content: textReply,
        timestamp: Date.now(),
        senderName: 'Roamie'
      };

      updateChatMessages(activeTripId, [...nextMsgs, botMessage]);

      if (profile.settings.responseMode !== 'text') {
        speakText(textReply, botMsgId);
      } else {
        transitionToState('idle');
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Quick prompt buttons dispatcher
  const dispatchQuickPrompt = (promptText: string) => {
    handleSendMessage(undefined, promptText);
  };

  // Exit conversation flow
  const handleExitChat = () => {
    safeCancelSpeech();
    safeStopRecognition();
    setSpeechFeedback(null);
    setActiveScreen('home');
  };

  // Mute toggle instant action
  const toggleMuteOption = () => {
    const nextMode = profile.settings.responseMode === 'text' ? 'combined' : 'text';
    setProfile(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        responseMode: nextMode
      }
    }));

    if (nextMode === 'text') {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMsgId(null);
    } else {
      speakText("Vocalization restored.");
    }
  };

  // Drag and drop photo processor with secure IndexedDB persistence
  const processBrandingLogo = (file: File) => {
    const r = new FileReader();
    r.onloadend = () => {
      const dataUrl = r.result as string;
      saveBrandingAsset('logoUrl', dataUrl).then(() => {
        console.log("Custom company logo successfully written to IndexedDB store.");
      }).catch(err => {
        console.error("IndexedDB store fail:", err);
      });

      setProfile(prev => ({
        ...prev,
        branding: {
          ...prev.branding,
          logoUrl: dataUrl,
          logoLocked: true, // Lock logo immediately upon upload
          allowAiReplacement: false,
          persistAssets: true
        }
      }));
    };
    r.readAsDataURL(file);
  };

  const processBrandingAvatar = (file: File) => {
    const r = new FileReader();
    r.onloadend = () => {
      const dataUrl = r.result as string;
      saveBrandingAsset('avatarUrl', dataUrl).then(() => {
        console.log("Custom portrait avatar successfully written to IndexedDB store.");
      }).catch(err => {
        console.error("IndexedDB store fail:", err);
      });

      setProfile(prev => ({
        ...prev,
        branding: {
          ...prev.branding,
          avatarUrl: dataUrl,
          avatarLocked: true, // Lock avatar immediately upon upload
          allowAiReplacement: false,
          persistAssets: true
        }
      }));
    };
    r.readAsDataURL(file);
  };

  const handleMessageAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onloadend = () => {
      setAttachedImage(r.result as string);
    };
    r.readAsDataURL(file);
  };

  // Submit manual activity block
  const handleAddCustomActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.title.trim()) return;

    setTrips(prev => prev.map(t => {
      if (t.tripId === activeTripId) {
        const days = [...t.itinerary.days];
        const dayIndex = days.findIndex(d => d.dayNumber === selectedDayNum);
        
        const activityItem: Activity = {
          time: newActivity.time,
          title: newActivity.title.trim(),
          description: newActivity.description.trim() || 'Custom scheduled adventure block.',
          savedByAI: false,
          addedBy: activeUser
        };

        if (dayIndex >= 0) {
          days[dayIndex] = {
            ...days[dayIndex],
            activities: [...days[dayIndex].activities, activityItem]
          };
        } else {
          days.push({
            dayNumber: selectedDayNum,
            date: new Date(Date.now() + (selectedDayNum - 1) * 86400000).toISOString().split('T')[0],
            activities: [activityItem]
          });
        }
        return { ...t, itinerary: { days } };
      }
      return t;
    }));

    // Reset builder
    setNewActivity({
      time: 'morning',
      title: '',
      description: ''
    });
    setShowAddActivityModal(false);
  };

  // Create absolute Physical Trip
  const handleCreateNewTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripData.destination.trim() || !newTripData.title.trim()) return;

    const id = `trip-${generateId()}`;
    const start = newTripData.startDate || new Date().toISOString().split('T')[0];
    const end = newTripData.endDate || new Date(Date.now() + 172800000).toISOString().split('T')[0];

    // Build default empty itinerary days
    const days: ItineraryDay[] = [
      {
        dayNumber: 1,
        date: start,
        activities: [
          {
            time: 'morning',
            title: 'Settle in ' + newTripData.destination,
            description: 'Unpack bag and stroll peacefully near our new cabin coordinates.',
            savedByAI: false
          }
        ]
      }
    ];

    const newTripItem: Trip = {
      tripId: id,
      userId: profile.userId,
      type: 'upcoming',
      title: newTripData.title.trim(),
      destination: newTripData.destination.trim(),
      startDate: start,
      endDate: end,
      status: 'draft',
      itinerary: { days },
      savedIdeas: []
    };

    setTrips(prev => [...prev, newTripItem]);

    // Create a corresponding fresh empty chat session
    setChats(prev => ({
      ...prev,
      [id]: {
        chatId: `chat-${id}`,
        tripId: id,
        userId: profile.userId,
        messages: [
          {
            id: generateId(),
            role: 'avatar',
            type: 'text',
            content: `Hello! I'm Roamie. I've set up a new space for our plans in ${newTripData.destination}. What's on your mind?`,
            timestamp: Date.now(),
            senderName: 'Roamie'
          }
        ]
      }
    }));

    // Reset form & open trip
    setNewTripData({
      destination: '',
      title: '',
      startDate: '',
      endDate: '',
      notes: ''
    });
    setShowCreateTripModal(false);
    
    // Auto transition to view this trip chat instantly!
    setActiveTripId(id);
    setActiveScreen('chat');
  };

  const toggleLockItinerary = (tripId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.tripId === tripId) {
        const nextStatus = t.status === 'draft' ? 'planned' : t.status === 'planned' ? 'active' : 'draft';
        return {
          ...t,
          status: nextStatus as 'draft' | 'planned' | 'active'
        };
      }
      return t;
    }));
  };

  // ---- SCREEN-SPECIFIC BOTTOM TAB CORRIDOR HANDLERS ----
  const handleHomeQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = homeInputText.trim();
    if (!query) return;

    setChatInputs(prev => ({ ...prev, [activeTripId]: query }));
    setActiveScreen('chat');
    setHomeInputText('');

    setTimeout(() => {
      handleSendMessage(undefined, query);
    }, 50);
  };

  const handleHomePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onloadend = () => {
      const activeTrip = trips.find(t => t.tripId === activeTripId) || trips[0];
      const activeTripName = activeTrip ? activeTrip.destination : 'Nova Scotia';
      const newPhoto: TripPhoto = {
        id: generateId(),
        url: r.result as string,
        caption: `${activeUser}'s newly uploaded slow trip memory near ${activeTripName}`,
        addedBy: activeUser,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tripId: activeTripId,
        location: activeTripName
      };
      setPhotos(prev => [newPhoto, ...prev]);
      setSuccessNotification(`Polaroid photo uploaded! Automatically organized to ${activeTripName}.`);
      setTimeout(() => setSuccessNotification(null), 3500);
    };
    r.readAsDataURL(file);
  };

  const getRandomMemoryPlaceholderUrl = () => {
    const images = [
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80", // Cozy autumn forest road
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80", // Serene blue ocean shore
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80", // Flat timber path woodland bridge
      "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=600&q=80", // Slow lavender floral meadow hills
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80"  // Majestic mountain hills
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  const startCamera = async () => {
    setCapturedPhotoPreview(null);
    setCapturedPhotoCaption('');
    setCapturedPhotoTripId(activeTripId || (trips[0] ? trips[0].tripId : ''));
    setCapturedPhotoAlbumId('album-scenery');
    setIsCameraOpen(true);
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacingMode },
          audio: false
        });
        streamRef.current = stream;
        // Bind to video element after delay to let the modal mount
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.warn(e));
          }
        }, 150);
      } else {
        setCameraError("Camera device access not supported in this sandboxed preview iframe mode.");
      }
    } catch (err: any) {
      console.warn("Camera fallback triggered:", err);
      setCameraError(`Camera fallback enabled. Feel free to snap a realistic slow-travel memory!`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCapturedPhotoPreview(null);
  };

  const toggleCameraFacingMode = async () => {
    const nextMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(nextMode);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: nextMode },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn(e));
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const capturePhotoSnapshot = () => {
    let capturedUrl = "";
    
    if (videoRef.current && !cameraError) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          capturedUrl = canvas.toDataURL('image/jpeg');
        }
      } catch (e) {
        capturedUrl = getRandomMemoryPlaceholderUrl();
      }
    } else {
      capturedUrl = getRandomMemoryPlaceholderUrl();
    }

    if (!capturedUrl || capturedUrl === "") {
      capturedUrl = getRandomMemoryPlaceholderUrl();
    }

    const activeTrip = trips.find(t => t.tripId === (capturedPhotoTripId || activeTripId)) || trips[0];
    const activeTripName = activeTrip ? activeTrip.destination : 'Nova Scotia';

    setCapturedPhotoPreview(capturedUrl);
    setCapturedPhotoCaption(`Slow road trip moment near ${activeTripName}`);
  };

  const saveCapturedPhoto = () => {
    if (!capturedPhotoPreview) return;

    const chosenTripId = capturedPhotoTripId || activeTripId || (trips[0] ? trips[0].tripId : '');
    const activeTrip = trips.find(t => t.tripId === chosenTripId) || trips[0];
    const activeTripName = activeTrip ? activeTrip.destination : 'Nova Scotia';
    
    const newPhoto: TripPhoto = {
      id: generateId(),
      url: capturedPhotoPreview,
      caption: capturedPhotoCaption || `Captured slow road trip moment near ${activeTripName} by ${activeUser}`,
      addedBy: activeUser,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tripId: chosenTripId,
      location: activeTripName,
      albumId: capturedPhotoAlbumId || 'album-scenery'
    } as any;

    setPhotos(prev => [newPhoto, ...prev]);
    stopCamera();
    setSuccessNotification(`Polaroid snapshot saved successfully to ${activeTripName}!`);
    setTimeout(() => setSuccessNotification(null), 3500);
  };

  const handleSharePhoto = async (type: 'text' | 'email' | 'airdrop' | 'link', photo: TripPhoto) => {
    setIsSharingSimulated(type);
    
    // Generate the universally shareable link for this specific Polaroid!
    const baseUrl = window.location.origin + window.location.pathname;
    const shareQuery = `?sharedPhotoUrl=${encodeURIComponent(photo.url)}&sharedPhotoCaption=${encodeURIComponent(photo.caption || '')}&sharedPhotoAddedBy=${encodeURIComponent((photo as any).addedBy || 'Rhonda')}&sharedPhotoDate=${encodeURIComponent((photo as any).timestamp || new Date().toLocaleDateString('en-US'))}`;
    const shareUrl = baseUrl + shareQuery;

    const shareTitle = "Cozy Polaroid from Susan & Rhonda's Roaming Story";
    const shareText = `Check out this special Polaroid moment: "${photo.caption || ''}"`;

    // Try to trigger the system's Native Share Sheet if supported (ideal for Android/iOS)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        setSuccessNotification("Native share sheet opened successfully!");
        setTimeout(() => setSuccessNotification(null), 3000);
        setIsSharingSimulated(null);
        return;
      } catch (shareErr) {
        console.log("[NativeShare] Navigator share failed or cancelled. Using direct fallback protocols.", shareErr);
      }
    }

    // Direct Protocols fallback for Desktop & browsers without navigator.share
    if (type === 'link') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setSuccessNotification("Polaroid share link copied to device clipboard!");
      } catch (e) {
        console.warn("Could not copy to clipboard:", e);
        setSuccessNotification("Share Link created! Please copy from address bar.");
      }
    } else if (type === 'text') {
      // Trigger native device SMS application
      try {
        const smsUri = `sms:?body=${encodeURIComponent(`${shareText} - View polaroid: ${shareUrl}`)}`;
        window.location.href = smsUri;
        setSuccessNotification("Launching native text messages draft...");
      } catch (e) {
        setSuccessNotification(`Drafted text message: "${photo.caption}"`);
      }
    } else if (type === 'email') {
      // Trigger native device Email application
      try {
        const mailUri = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\nView polaroid: ${shareUrl}\n\nWarmly,\nSusan & Rhonda`)}`;
        window.location.href = mailUri;
        setSuccessNotification("Launching native email client draft...");
      } catch (e) {
        setSuccessNotification(`Compiled email record into travel journal!`);
      }
    } else if (type === 'airdrop') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setSuccessNotification("Link copied! Paste to send via AirDrop or local Bluetooth node.");
      } catch (e) {
        setSuccessNotification("Scanning local Bluetooth and AirDrop nodes... Snapshot shared!");
      }
    }
    
    setTimeout(() => {
      setSuccessNotification(null);
      setIsSharingSimulated(null);
    }, 4500);
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, status: 'deleted', deletedAt: Date.now() } as any : p));
    if (selectedPhotoForDetail?.id === photoId) {
      setSelectedPhotoForDetail(null);
    }
    setSuccessNotification("Moved photo memory to Trash.");
    setTimeout(() => setSuccessNotification(null), 3000);
  };

  const handleShareMany = (type: 'text' | 'email' | 'airdrop' | 'link', photoIds: string[]) => {
    setIsSharingSimulated(type);
    const count = photoIds.length;
    
    if (type === 'link') {
      setSuccessNotification(`Generated shared link for ${count} polaroids!`);
    } else {
      setSuccessNotification(`Prepared ${count} polaroids for shared ${type} delivery.`);
    }
    
    setTimeout(() => {
      setSuccessNotification(null);
      setIsSharingSimulated(null);
      setSelectedPhotoIds([]);
      setMultiSelectActive(false);
    }, 4000);
  };

  const handleDownloadAlbum = (albumId: string) => {
    const albumName = albumId === 'all' ? 'All Photos' : albums.find(a => a.id === albumId)?.name || 'Album';
    const count = photos.filter(p => (p as any).status !== 'deleted' && (albumId === 'all' || (p as any).albumId === albumId)).length;
    
    if (count === 0) {
      setSuccessNotification("No photos in this album to download.");
    } else {
      setSuccessNotification(`Packaging ${count} polaroids from "${albumName}" for batch download...`);
    }
    setTimeout(() => setSuccessNotification(null), 4000);
  };

  const handleShareAlbum = (type: string, albumId: string) => {
    const albumName = albumId === 'all' ? 'All Photos' : albums.find(a => a.id === albumId)?.name || 'Album';
    setSuccessNotification(`Sharing "${albumName}" album via ${type}...`);
    setTimeout(() => setSuccessNotification(null), 4000);
  };

  const handleAddJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalInputText.trim()) return;
    const newJournal = {
      id: generateId(),
      text: journalInputText.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: activeUser,
      status: 'active'
    };
    setJournals(prev => [newJournal, ...prev]);
    setJournalInputText('');
  };

  const handleDeleteJournal = (journalId: string) => {
    setJournals(prev => prev.map(j => j.id === journalId ? { ...j, status: 'deleted', deletedAt: Date.now() } as any : j));
    setSuccessNotification("Moved journal to Trash.");
    setTimeout(() => setSuccessNotification(null), 3000);
  };

  const handleStartTrip = (tripId: string) => {
    // any existing current trip gets past status and upcoming type
    setTrips(prev => prev.map(t => {
      if (t.status === 'current') {
        return { ...t, status: 'past', type: 'upcoming' as const };
      }
      if (t.tripId === tripId) {
        return { ...t, status: 'current', type: 'current' as const };
      }
      return t;
    }));
    setActiveTripId(tripId);
    
    // Auto show success feedback
    const started = trips.find(t => t.tripId === tripId);
    if (started) {
      setSuccessNotification(`Successfully started trip to ${started.destination}!`);
      setTimeout(() => setSuccessNotification(null), 4000);
    }
  };

  const handleCompleteTrip = (tripId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.tripId === tripId) {
        return { ...t, status: 'past', type: 'upcoming' as const };
      }
      return t;
    }));
    const completed = trips.find(t => t.tripId === tripId);
    if (completed) {
      setSuccessNotification(`Completed trip to ${completed.destination}! Moved to Past Trips.`);
      setTimeout(() => setSuccessNotification(null), 4000);
    }
  };

  const handleSoftDeleteTrip = (tripId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.tripId === tripId) {
        return { ...t, status: 'deleted', deletedAt: Date.now() };
      }
      return t;
    }));
    
    const deleted = trips.find(t => t.tripId === tripId);
    if (deleted) {
      setSuccessNotification(`Moved "${deleted.title}" to Trash.`);
      setTimeout(() => setSuccessNotification(null), 4000);
    }

    if (activeTripId === tripId) {
      const remaining = trips.filter(t => t.tripId !== tripId && t.status !== 'deleted');
      if (remaining.length > 0) {
        setActiveTripId(remaining[0].tripId);
      }
    }
  };

  const handleRestoreTrip = (tripId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.tripId === tripId) {
        return { ...t, status: 'upcoming' };
      }
      return t;
    }));
    
    const restored = trips.find(t => t.tripId === tripId);
    if (restored) {
      setSuccessNotification(`Successfully restored "${restored.title}" to Upcoming Trips!`);
      setTimeout(() => setSuccessNotification(null), 4000);
    }
  };

  const handlePermanentlyDeleteTrip = (tripId: string) => {
    setTrips(prev => prev.filter(t => t.tripId !== tripId));
    setSuccessNotification("Trip permanently deleted.");
    setTimeout(() => setSuccessNotification(null), 3000);
  };

  const handlePermanentlyDeleteTripConfirm = (tripId: string) => {
    if (confirm("Are you sure Susan and Rhonda want to permanently delete this travel blueprint from device storage? This cannot be undone.")) {
      handlePermanentlyDeleteTrip(tripId);
    }
  };

  const handleRestoreAll = () => {
    setTrips(prev => prev.map(t => {
      if (t.status === 'deleted') {
        return { ...t, status: 'upcoming' };
      }
      return t;
    }));
    setPhotos(prev => prev.map(p => (p as any).status === 'deleted' ? { ...p, status: 'active' } as any : p));
    setJournals(prev => prev.map(j => (j as any).status === 'deleted' ? { ...j, status: 'active' } as any : j));
    
    // Restore deletedIdeas back to their respective trips
    deletedIdeas.forEach(idea => {
      setTrips(prev => prev.map(t => {
        if (t.tripId === idea.tripId) {
          // Prevent duplicates
          const hasAlready = t.savedIdeas.some(i => i.text === idea.text);
          if (!hasAlready) {
            return {
              ...t,
              savedIdeas: [...t.savedIdeas, { text: idea.text, createdAt: Date.now() }]
            };
          }
        }
        return t;
      }));
    });
    setDeletedIdeas([]);

    setSuccessNotification("All deleted items restored successfully!");
    setTimeout(() => setSuccessNotification(null), 4000);
  };

  const handleDeleteAllPermanently = () => {
    setTrips(prev => prev.filter(t => t.status !== 'deleted'));
    setPhotos(prev => prev.filter(p => (p as any).status !== 'deleted'));
    setJournals(prev => prev.filter(j => (j as any).status !== 'deleted'));
    setDeletedIdeas([]);
    setSuccessNotification("Trash cleared completely.");
    setTimeout(() => setSuccessNotification(null), 3000);
    setSelectedTrashKeys([]);
  };

  const handleRestoreSelected = (keys: string[]) => {
    keys.forEach(key => {
      if (key.startsWith('trip-')) {
        const id = key.substring(5);
        setTrips(prev => prev.map(t => t.tripId === id ? { ...t, status: 'upcoming' } : t));
      } else if (key.startsWith('photo-')) {
        const id = key.substring(6);
        setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } as any : p));
      } else if (key.startsWith('journal-')) {
        const id = key.substring(8);
        setJournals(prev => prev.map(j => j.id === id ? { ...j, status: 'active' } as any : j));
      } else if (key.startsWith('idea-')) {
        const content = key.substring(5);
        const sepIndex = content.indexOf('::');
        if (sepIndex !== -1) {
          const tripId = content.substring(0, sepIndex);
          const text = content.substring(sepIndex + 2);
          setTrips(prev => prev.map(t => {
            if (t.tripId === tripId) {
              const hasAlready = t.savedIdeas.some(i => i.text === text);
              if (!hasAlready) {
                return { ...t, savedIdeas: [...t.savedIdeas, { text, createdAt: Date.now() }] };
              }
            }
            return t;
          }));
          setDeletedIdeas(prev => prev.filter(i => !(i.text === text && i.tripId === tripId)));
        }
      }
    });
    setSuccessNotification(`Restored selected items.`);
    setTimeout(() => setSuccessNotification(null), 3000);
    setSelectedTrashKeys([]);
  };

  const handlePermanentlyDeleteSelected = (keys: string[]) => {
    keys.forEach(key => {
      if (key.startsWith('trip-')) {
        const id = key.substring(5);
        setTrips(prev => prev.filter(t => t.tripId !== id));
      } else if (key.startsWith('photo-')) {
        const id = key.substring(6);
        setPhotos(prev => prev.filter(p => p.id !== id));
      } else if (key.startsWith('journal-')) {
        const id = key.substring(8);
        setJournals(prev => prev.filter(j => j.id !== id));
      } else if (key.startsWith('idea-')) {
        const content = key.substring(5);
        const sepIndex = content.indexOf('::');
        if (sepIndex !== -1) {
          const tripId = content.substring(0, sepIndex);
          const text = content.substring(sepIndex + 2);
          setDeletedIdeas(prev => prev.filter(i => !(i.text === text && i.tripId === tripId)));
        }
      }
    });
    setSuccessNotification(`Permanently deleted selected items.`);
    setTimeout(() => setSuccessNotification(null), 3000);
    setSelectedTrashKeys([]);
  };

  const toggleTrashSelect = (key: string) => {
    setSelectedTrashKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleRestorePhoto = (photoId: string) => {
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, status: 'active' } as any : p));
    setSuccessNotification("Successfully restored photo memory.");
    setTimeout(() => setSuccessNotification(null), 3000);
  };

  const handlePermanentlyDeletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    setSuccessNotification("Photo memory permanently deleted.");
    setTimeout(() => setSuccessNotification(null), 3000);
  };

  const handleRestoreJournal = (journalId: string) => {
    setJournals(prev => prev.map(j => j.id === journalId ? { ...j, status: 'active' } as any : j));
    setSuccessNotification("Successfully restored journal entry.");
    setTimeout(() => setSuccessNotification(null), 3000);
  };

  const handlePermanentlyDeleteJournal = (journalId: string) => {
    setJournals(prev => prev.filter(j => j.id !== journalId));
    setSuccessNotification("Journal entry permanently deleted.");
    setTimeout(() => setSuccessNotification(null), 3000);
  };

  const handleRestoreIdea = (ideaText: string, tripId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.tripId === tripId) {
        const hasAlready = t.savedIdeas.some(i => i.text === ideaText);
        if (!hasAlready) {
          return {
            ...t,
            savedIdeas: [...t.savedIdeas, { text: ideaText, createdAt: Date.now() }]
          };
        }
      }
      return t;
    }));
    setDeletedIdeas(prev => prev.filter(i => !(i.text === ideaText && i.tripId === tripId)));
    setSuccessNotification("Successfully restored saved idea.");
    setTimeout(() => setSuccessNotification(null), 3000);
  };

  const handlePermanentlyDeleteIdea = (ideaText: string, tripId: string) => {
    setDeletedIdeas(prev => prev.filter(i => !(i.text === ideaText && i.tripId === tripId)));
    setSuccessNotification("Saved idea permanently deleted.");
    setTimeout(() => setSuccessNotification(null), 3000);
  };

  const handleChooseNavigation = (system: 'google' | 'apple' | 'waze' | 'in-app') => {
    if (!navigationTriggerSource) return;
    const { label, query } = navigationTriggerSource;
    setNavigationTriggerSource(null);

    const encodedQuery = encodeURIComponent(query);
    if (system === 'google') {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedQuery}`, '_blank');
      setSuccessNotification(`Opened Google Maps for ${label}`);
      setTimeout(() => setSuccessNotification(null), 3000);
    } else if (system === 'apple') {
      window.open(`https://maps.apple.com/?q=${encodedQuery}`, '_blank');
      setSuccessNotification(`Opened Apple Maps for ${label}`);
      setTimeout(() => setSuccessNotification(null), 3000);
    } else if (system === 'waze') {
      window.open(`https://waze.com/ul?q=${encodedQuery}`, '_blank');
      setSuccessNotification(`Opened Waze for ${label}`);
      setTimeout(() => setSuccessNotification(null), 3000);
    } else if (system === 'in-app') {
      setActiveRouteTarget({ label, query });
      setSimulatedDistance(parseFloat((2.5 + Math.random() * 4).toFixed(1)));
      setIsSimulatedRoutingActive(true);
      setActiveScreen('drive');
      setSuccessNotification(`Connected active navigation co-pilot routing to: ${label}!`);
      setTimeout(() => setSuccessNotification(null), 3000);
    }
  };

  const handleSaveTripEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;
    setTrips(prev => prev.map(t => t.tripId === editingTrip.tripId ? editingTrip : t));
    setEditingTrip(null);
    setSuccessNotification("Saved trip updates.");
    setTimeout(() => setSuccessNotification(null), 3000);
  };

  // AI capabilities inside the app
  const currentTrip = trips.find(t => t.tripId === activeTripId) || trips[0];
  const activeChat = chats[activeTripId] || { messages: [] };

  // Trip Lifecycle helper filters
  const currentActiveTrip = trips.find(t => t.status === 'current');
  const upcomingTrips = trips.filter(t => t.status === 'upcoming' || t.status === 'planned' || t.status === 'draft');
  const pastTrips = trips.filter(t => t.status === 'past' || t.status === 'completed');
  const deletedTrips = trips.filter(t => t.status === 'deleted');

  const isHome = activeScreen === 'home';

  if (isSplashActive) {
    return (
      <div className="min-h-screen bg-[#0C0B0A] text-stone-200 flex flex-col items-center justify-center font-mono p-6 select-none relative">
        <div className="flex flex-col items-center space-y-6 max-w-sm w-full text-center animate-pulse">
          
          {/* Main loader logo showcase */}
          <div className="h-24 w-auto flex items-center justify-center mb-1">
            {profile.branding.logoUrl ? (
              <img 
                src={profile.branding.logoUrl} 
                alt="Branded Corporate Logo" 
                className="max-h-24 w-auto object-contain rounded-xl shadow-lg border border-stone-850 bg-stone-900/40 p-1.5"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#1E1C1A] border border-amber-500/30 flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 100 100" className="h-9 w-9 text-amber-500 transform -rotate-45" fill="currentColor">
                  <path d="M50 15 L80 80 L50 65 L20 80 Z" stroke="none" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="space-y-1.5">
            <h1 className="font-serif italic font-extrabold text-3xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-[#10BACB] to-[#8ED521] select-none font-black leading-tight">
              Roamie
            </h1>
            <p className="text-[#7C7C59] text-[9.5px] uppercase tracking-widest font-black leading-none">
              Active System v4.0
            </p>
          </div>
          
          {/* Elegant Loading strip */}
          <div className="w-full max-w-[120px] bg-stone-900 h-1 rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-amber-500 rounded-full animate-bounce" />
          </div>
          
          <p className="text-stone-500 text-[10px] font-sans">
            Loading secure vehicle profiles...
          </p>
        </div>
      </div>
    );
  }

  if (urlSharedPhoto) {
    return (
      <div className="min-h-screen bg-[#141312] text-[#EBE6E0] flex flex-col items-center justify-center p-4 md:p-6 font-sans relative overflow-y-auto w-full">
        {/* Background Aura */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#7C7C59]/10 via-[#2C2C20]/5 to-transparent pointer-events-none z-0" />

        <div className="max-w-md w-full mx-auto text-center space-y-6 z-10 relative py-8">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#7C7C59] font-black">
              🌍 Shared Polaroid Memory
            </span>
            <h1 className="text-2xl font-serif font-normal tracking-tight text-stone-100">
              Roaming Story
            </h1>
            <p className="text-stone-400 text-xs font-sans">
              A cozy moment shared with you from Susan & Rhonda's journey.
            </p>
          </div>

          {/* Polaroid Frame */}
          <div className="bg-[#FAF9F5] shadow-2xl rounded-sm p-4 pb-6 transform rotate-1 hover:rotate-0 transition-all duration-500 border border-stone-200/50 max-w-sm mx-auto text-[#2C2C20]">
            <div className="aspect-square w-full overflow-hidden bg-stone-100 border border-stone-200/40 relative rounded-sm">
              <img
                src={urlSharedPhoto.url}
                alt={urlSharedPhoto.caption}
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="mt-5 space-y-2.5 text-left px-1">
              <p className="font-serif text-base italic leading-relaxed text-stone-800 min-h-[48px] border-b border-stone-200/60 pb-3 font-medium">
                "{urlSharedPhoto.caption}"
              </p>
              
              <div className="flex items-center justify-between font-mono text-[9px] text-stone-500 uppercase tracking-wider leading-none pt-1">
                <span>By {urlSharedPhoto.addedBy}</span>
                <span>{urlSharedPhoto.date}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="button"
              onClick={() => {
                // Clear URL query parameters from browser location bar without full reload
                try {
                  const targetUrl = window.location.origin + window.location.pathname;
                  window.history.replaceState({}, document.title, targetUrl);
                } catch(e) {}
                setUrlSharedPhoto(null);
              }}
              className="w-full py-3 bg-[#7C7C59] text-[#141211] hover:bg-[#8D8D6A] font-black uppercase text-[10px] font-mono tracking-widest rounded-xl transition duration-300 shadow-md transform hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Susan & Rhonda's Travel Board</span>
            </button>
            
            <p className="text-[9px] text-stone-500 font-mono tracking-wide">
              Securely stored in active device flash memory nodes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isHome ? 'bg-[#FAF9F5] text-[#2C2C20]' : 'bg-[#141312] text-[#EBE6E0]'} flex flex-col font-sans overflow-x-hidden relative select-none pb-12`}>
      
      {/* Absolute Header Ambient Aura */}
      {!isHome && (
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#7C7C59]/10 via-[#2C2C20]/5 to-transparent pointer-events-none z-0" />
      )}

      {/* FIXED TOP NAVIGATION BAR */}
      <header className={`w-full sticky top-0 z-10 shadow-md border-b transition-colors duration-300 backdrop-blur-md bg-opacity-95 ${
        isHome 
          ? 'bg-[#FAF9F5] border-stone-200/70 text-[#2C2C20]' 
          : 'bg-[#1E1C1A] border-[#2C2A26] text-[#EBE6E0]'
      }`}>
        <div className="max-w-md w-full mx-auto md:max-w-xl lg:max-w-2xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {profile.branding.logoUrl ? (
            <img 
              src={profile.branding.logoUrl} 
              alt="Locked Logo" 
              className={`h-8 w-auto object-contain rounded-md border ${isHome ? 'border-stone-200 shadow-sm' : 'border-[#2C2A26]'}`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div 
              onClick={() => !profile.branding.logoLocked && logoInputRef.current?.click()}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border border-dashed transition-colors ${
                isHome 
                  ? 'bg-stone-100 border-stone-300/80 text-amber-600 hover:border-amber-500/80 hover:bg-stone-200' 
                  : 'bg-[#2C2A26] border-[#5A5A40]/40 text-amber-500/80 hover:border-amber-500/80 hover:bg-stone-800'
              } ${!profile.branding.logoLocked ? 'cursor-pointer' : ''}`}
              title={!profile.branding.logoLocked ? "Upload product logo silently (One-Time)" : undefined}
            >
              <svg viewBox="0 0 100 100" className={`h-5 w-5 ${isHome ? 'text-amber-600' : 'text-amber-500/80'} transform -rotate-45`} fill="currentColor">
                <path d="M50 15 L80 80 L50 65 L20 80 Z" stroke="none" />
              </svg>
            </div>
          )}


        </div>

        {/* Action controllers in header */}
        <div className="flex items-center gap-2">
          {/* User selector toggles inside header for non-home, simple close for home */}
          <div className={`p-0.5 rounded-lg flex items-center ${isHome ? 'bg-stone-200/60 border border-stone-300/40' : 'bg-[#141312] border border-[#2C221F]'}`}>
            <button 
              onClick={() => handleUserToggle('Rhonda')}
              className={`text-[9px] font-mono px-2 py-1 rounded transition-all cursor-pointer ${
                activeUser === 'Rhonda' 
                  ? 'text-white font-extrabold shadow-sm' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              style={
                activeUser === 'Rhonda' 
                  ? { backgroundColor: getUserColorStyle('Rhonda').hex } 
                  : {}
              }
            >
              {getUserColorStyle('Rhonda').displayName}
            </button>
            <button 
              onClick={() => handleUserToggle('Susan')}
              className={`text-[9px] font-mono px-2 py-1 rounded transition-all cursor-pointer ${
                activeUser === 'Susan' 
                  ? 'text-white font-extrabold shadow-sm' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              style={
                activeUser === 'Susan' 
                  ? { backgroundColor: getUserColorStyle('Susan').hex } 
                  : {}
              }
            >
              {getUserColorStyle('Susan').displayName}
            </button>
          </div>

          {/* Drive Mode toggle buttons */}
          <button 
            onClick={() => setActiveScreen(activeScreen === 'drive' ? 'home' : 'drive')}
            className={`p-1 px-2.5 rounded-lg font-mono text-[9px] tracking-wider uppercase flex items-center gap-1 cursor-pointer transition-all border ${
              activeScreen === 'drive'
                ? 'bg-amber-500 border-amber-600 text-stone-950 font-black shadow'
                : isHome 
                ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100' 
                : 'bg-gradient-to-r from-teal-950 to-emerald-950 border-teal-850 text-teal-300 hover:from-teal-900'
            }`}
            title={activeScreen === 'drive' ? "Exit safe drive mode" : "Safe drive mode"}
          >
            <Car className={`w-3.5 h-3.5 ${activeScreen === 'drive' ? 'text-stone-950' : isHome ? 'text-amber-600' : 'animate-pulse'}`} />
            <span>Drive</span>
          </button>

          {/* Settings gear anchor */}
          <button
            onClick={() => {
              setIsBluetoothModalOpen(true);
              startBluetoothScan();
            }}
            title={isBluetoothConnected ? `Bluetooth Active: ${selectedBluetoothDeviceName}` : "Bluetooth Disconnected (Click to Link Device)"}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
              isHome 
                ? isBluetoothConnected 
                  ? 'bg-indigo-50 border-indigo-200 text-[#5F5FA6] hover:bg-indigo-100 shadow-sm'
                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 animate-pulse'
                : isBluetoothConnected
                  ? 'bg-[#181534] border-[#2E2856] text-[#7E7AEC] hover:bg-indigo-900/50'
                  : 'bg-[#3A2218]/90 border-[#5A3828]/50 text-amber-500/80 hover:text-amber-400 animate-pulse'
            }`}
          >
            <Bluetooth className={`w-3.5 h-3.5 ${!isBluetoothConnected ? 'animate-bounce' : ''}`} />
          </button>

          {/* Settings gear anchor */}
          <button 
            onClick={() => setActiveScreen(activeScreen === 'settings' ? 'home' : 'settings')}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
              isHome 
                ? 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 shadow-sm' 
                : 'bg-[#2C2A26] border-[#2C2A26] text-stone-300 hover:text-white hover:border-stone-600'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
          </button>
        </div>
        </div>
      </header>

      {/* CORE MOBILE CONTAINER FRAME */}
      <main className={`flex-grow max-w-md w-full mx-auto md:max-w-xl lg:max-w-2xl transition-colors duration-300 ${isHome ? 'bg-[#FAF9F5] text-[#2C2C20]' : 'bg-[#141312] border-x border-[#2C2A26]'} flex flex-col relative z-20 pb-24`}>
        
        {/* Invisible file inputs for silent one-time setup action if triggered */}
        <input type="file" ref={logoInputRef} accept="image/*" onChange={(e) => e.target.files && processBrandingLogo(e.target.files[0])} className="hidden" />
        <input type="file" ref={avatarInputRef} accept="image/*" onChange={(e) => e.target.files && processBrandingAvatar(e.target.files[0])} className="hidden" />
        <audio 
          ref={audioRef} 
          src={DRIVE_TRACKS[currentTrackIndex]?.url} 
          onEnded={() => handleSkipTrack(false)} 
          loop={false}
          style={{ display: 'none' }}
        />

        {/* ---- SCREEN 1: HOME DASHBOARD ---- */}
        {activeScreen === 'home' && (
          <div className="p-4 space-y-6 animate-fade-in flex flex-col justify-between min-h-[calc(100vh-140px)] text-[#2C2C20]">
            
            {/* Aesthetic Top Spacer */}
            <div className="h-1" />

            {/* THE TOP SECTION & BRANDING */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 pt-1">
              
              {/* AVATAR WITH INTEGRATED MUTE CONTROLLER */}
              <div className="relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={toggleListening}
                  className="hover:scale-105 active:scale-95 transition-all focus:outline-none cursor-pointer"
                  title="Click to start listening / activate voice session"
                >
                  <RoamieAvatar 
                    size="xl" 
                    imgSrc={profile.branding.avatarUrl} 
                    isListening={roamieState === 'listening'} 
                    isSpeaking={roamieState === 'speaking' || speakingMsgId !== null} 
                  />
                </button>

                {/* Stylish floating Mute Toggle */}
                <button 
                  onClick={toggleMuteOption}
                  className={`absolute -bottom-1 -right-1 p-2 rounded-full border shadow-md transition-all active:scale-90 cursor-pointer ${
                    profile.settings.responseMode === 'text'
                      ? 'bg-rose-500 border-rose-600 text-white hover:bg-rose-600'
                      : 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600'
                  }`}
                  title={profile.settings.responseMode === 'text' ? 'Unmute companion voice' : 'Mute companion voice'}
                >
                  {profile.settings.responseMode === 'text' ? (
                    <VolumeX className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 stroke-[2.5] animate-pulse" />
                  )}
                </button>
              </div>

              {/* FANTABULOUS APP TITLE & SUBTITLE */}
              <div className="space-y-1">
                <h1 className="font-serif italic font-extrabold text-5xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-[#10BACB] to-[#8ED521] leading-normal select-none drop-shadow-sm font-black">
                  Roamie
                </h1>
                <p className="text-stone-600 font-sans text-xs font-semibold tracking-tight leading-normal">
                  Welcome, Rhonda & Susan! Where are we going next?
                </p>
              </div>
            </div>

            {/* REDESIGNED TRIP LIFECYCLE DASHBOARD (RECOMMENDED PAGE ORDER) */}
            <div className="space-y-6 flex-grow flex flex-col pt-2 pb-4">
              
              {/* 1. CURRENT TRIP (TOP SECTION - SINGLE LIVE TRIP ONLY) */}
              <div className="bg-white border-2 border-stone-200/80 rounded-3xl p-5 shadow-sm max-w-sm w-full mx-auto space-y-3.5 relative">
                <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-[9.5px] font-mono text-[#7C7C59] uppercase tracking-wider font-extrabold flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${currentActiveTrip ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
                    Current Trip
                  </span>
                  {currentActiveTrip && (
                    <span className="text-[8px] font-mono bg-emerald-50 border border-emerald-200/50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      Live Now
                    </span>
                  )}
                </div>

                {currentActiveTrip ? (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <h3 className="font-serif font-black text-sm text-stone-900 leading-tight">
                        {currentActiveTrip.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[9.5px] text-stone-500 font-mono">
                        <span className="flex items-center gap-0.5 whitespace-nowrap">
                          <MapPin className="w-2.5 h-2.5 text-stone-400" />
                          {currentActiveTrip.destination}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="flex items-center gap-0.5 whitespace-nowrap">
                          <Calendar className="w-2.5 h-2.5 text-stone-400" />
                          {currentActiveTrip.startDate} — {currentActiveTrip.endDate}
                        </span>
                      </div>
                    </div>

                    {/* Ongoing timeline/story view */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-150 space-y-2">
                      <span className="text-[8px] font-mono text-[#7C7C59] uppercase tracking-wider block font-bold">
                        📍 Active Story Timeline:
                      </span>
                      <div className="space-y-2">
                        {currentActiveTrip.itinerary?.days?.[0]?.activities?.slice(0, 2).map((activity, idx) => (
                          <div key={idx} className="flex gap-2 items-start text-stone-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-[9.5px] font-serif font-extrabold leading-none block">
                                {activity.title}
                              </span>
                              <span className="text-[8.5px] text-stone-400 font-serif leading-tight block">
                                {activity.description}
                              </span>
                            </div>
                          </div>
                        ))}
                        {(!currentActiveTrip.itinerary?.days?.[0]?.activities || currentActiveTrip.itinerary.days[0].activities.length === 0) && (
                          <p className="text-[9px] text-stone-400 italic">No timeline entries yet. Start chatting with Roamie below!</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-0.5">
                      <button
                        onClick={() => {
                          setActiveTripId(currentActiveTrip.tripId);
                          setActiveScreen('chat');
                        }}
                        className="flex-1 py-2 bg-stone-900 hover:bg-neutral-800 text-white rounded-xl font-mono text-[9px] uppercase font-black text-center transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        🗣️ Roamie Lounge
                      </button>
                      <button
                        onClick={() => handleCompleteTrip(currentActiveTrip.tripId)}
                        className="py-2 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-mono text-[9px] uppercase font-black transition cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                        title="Mark trip as completed and archive"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <Compass className="w-8 h-8 text-stone-300 mx-auto stroke-[1.2]" />
                    <div className="space-y-1">
                      <p className="font-serif text-[11px] font-bold text-stone-700">No current trip yet</p>
                      <p className="font-serif text-[9.5px] italic text-stone-400 pr-2 pl-2">Ready to embark on a beautiful adventure? Start an upcoming trip below!</p>
                    </div>
                    {upcomingTrips.length > 0 && (
                      <button
                        onClick={() => handleStartTrip(upcomingTrips[0].tripId)}
                        className="py-1.5 px-3 bg-[#7C7C59] hover:bg-[#5A5A40] text-white font-mono text-[8px] uppercase font-black rounded-lg transition-all shadow cursor-pointer inline-flex items-center gap-1"
                      >
                        🚀 Start Upcoming Trip
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 2. ADD NEW TRIP (COMPACT & SUBTLE INTERFACE) */}
              <div className="max-w-sm w-full mx-auto">
                <button
                  type="button"
                  onClick={() => setShowCreateTripModal(true)}
                  className="w-full py-2.5 px-4 bg-stone-50 border border-dashed border-stone-200/80 hover:border-[#7C7C59]/40 hover:bg-white rounded-2xl flex items-center justify-center gap-1.5 text-stone-500 hover:text-[#7C7C59] transition-all cursor-pointer shadow-sm"
                  title="Plan a new upcoming trip model"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-serif text-[10.5px] italic font-semibold">Plan New Shared Adventure...</span>
                </button>
              </div>

              {/* 3. UPCOMING TRIPS SECTION */}
              <div className="max-w-sm w-full mx-auto space-y-2">
                <button
                  type="button"
                  onClick={() => setUpcomingTripsExpanded(!upcomingTripsExpanded)}
                  className="w-full flex items-center justify-between py-1 border-b border-stone-200/40 select-none text-left cursor-pointer"
                >
                  <span className="text-[9.5px] font-mono text-[#7C7C59] uppercase tracking-wider font-black flex items-center gap-1">
                    {upcomingTripsExpanded ? '▼' : '▶'} 📅 Upcoming Trips ({upcomingTrips.length})
                  </span>
                  <span className="text-[8px] font-mono text-stone-400">
                    {upcomingTripsExpanded ? 'Collapse' : 'Expand'}
                  </span>
                </button>

                {upcomingTripsExpanded && (
                  <div className="space-y-2 pt-1 animate-fade-in">
                    {upcomingTrips.length === 0 ? (
                      <div className="p-3 bg-white border border-stone-200/60 rounded-2xl text-center py-5 text-stone-400 font-serif text-[10px] italic shadow-sm">
                        No upcoming adventures. Tap the "+" button above to design one together.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {upcomingTrips.map(trip => (
                          <div 
                            key={trip.tripId} 
                            onClick={() => {
                              setActiveTripId(trip.tripId);
                              setActiveScreen('chat');
                            }}
                            className="p-3 bg-white border border-stone-200 hover:border-[#7C7C59]/40 rounded-2xl flex items-center justify-between cursor-pointer transition shadow-sm relative group"
                          >
                            <div className="space-y-0.5 pr-3 flex-grow min-w-0">
                              <span className="font-serif font-black text-[11.5px] text-stone-900 block leading-tight truncate">
                                {trip.title}
                              </span>
                              <div className="flex items-center gap-1.5 text-[8.5px] text-stone-400 font-mono leading-none">
                                <MapPin className="w-2 h-2 shrink-0" />
                                <span className="truncate max-w-[80px]">{trip.destination}</span>
                                <span>•</span>
                                <Calendar className="w-2 h-2 shrink-0" />
                                <span>{trip.startDate}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleStartTrip(trip.tripId)}
                                className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[8.5px] font-mono uppercase font-black rounded-lg border border-emerald-200/80 transition"
                                title="Make this trip current and live"
                              >
                                Go Live
                              </button>
                              <button 
                                onClick={() => setEditingTrip(trip)}
                                className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded"
                                title="Edit trip"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => setTripToDelete(trip)}
                                className="p-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Move to Trash"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4. PAST TRIPS SECTION */}
              <div className="max-w-sm w-full mx-auto space-y-2">
                <button
                  type="button"
                  onClick={() => setPastTripsExpanded(!pastTripsExpanded)}
                  className="w-full flex items-center justify-between py-1 border-b border-stone-200/40 select-none text-left cursor-pointer"
                >
                  <span className="text-[9.5px] font-mono text-[#7C7C59] uppercase tracking-wider font-black flex items-center gap-1">
                    {pastTripsExpanded ? '▼' : '▶'} 📂 Past Trips ({pastTrips.length})
                  </span>
                  <span className="text-[8px] font-mono text-stone-400">
                    {pastTripsExpanded ? 'Collapse' : 'Expand'}
                  </span>
                </button>

                {pastTripsExpanded && (
                  <div className="space-y-1.5 pt-1 animate-fade-in">
                    {pastTrips.length === 0 ? (
                      <div className="p-3 bg-white border border-stone-200/60 rounded-2xl text-center py-4 text-stone-400 font-serif text-[10px] italic shadow-sm">
                        No completed journeys yet. Your archives will appear here.
                      </div>
                    ) : (
                      <div className="space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
                        {pastTrips.map(trip => (
                          <div 
                            key={trip.tripId} 
                            onClick={() => {
                              setActiveTripId(trip.tripId);
                              setActiveScreen('chat');
                            }}
                            className="p-2.5 bg-stone-50 hover:bg-white border border-stone-200 rounded-2xl flex items-center justify-between cursor-pointer transition shadow-inner"
                          >
                            <div className="space-y-0.5 pr-2 flex-grow min-w-0">
                              <span className="font-serif font-bold text-[11px] text-stone-600 block leading-tight truncate">
                                {trip.title}
                              </span>
                              <div className="flex items-center gap-1 text-[8px] text-stone-400 font-mono leading-none">
                                <MapPin className="w-2 h-2" />
                                <span>{trip.destination}</span>
                              </div>
                            </div>
                            <span className="text-[7px] font-mono uppercase bg-stone-200 text-stone-500 px-1.5 py-0.5 rounded leading-none shrink-0 font-bold">
                              Completed
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SUBTLE FLOATING RECYCLE TRIGGER */}
              <div className="fixed bottom-16 left-4 z-50">
                <button
                  id="recycle-bin-toggle"
                  onClick={() => {
                    setIsRecycleBinOpen(!isRecycleBinOpen);
                    setSelectedTrashKeys([]);
                  }}
                  className={`p-2.5 rounded-full shadow-2xl border transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-mono font-bold ${
                    isRecycleBinOpen 
                      ? 'bg-amber-500 border-amber-600 text-stone-900 scale-105'
                      : (deletedTrips.length + photos.filter(p => (p as any).status === 'deleted').length + journals.filter(j => (j as any).status === 'deleted').length + deletedIdeas.length) > 0
                      ? 'bg-stone-950/95 hover:bg-stone-900 border-stone-850 text-amber-500 hover:scale-105'
                      : 'bg-stone-900/40 hover:bg-stone-900/60 border-stone-850/50 text-stone-500 opacity-60 font-medium'
                  }`}
                  title="Our Recycle Bin"
                >
                  <span className="text-base select-none leading-none">♻️</span>
                  {(deletedTrips.length + photos.filter(p => (p as any).status === 'deleted').length + journals.filter(j => (j as any).status === 'deleted').length + deletedIdeas.length) > 0 && (
                    <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded-full leading-none font-bold">
                      {deletedTrips.length + photos.filter(p => (p as any).status === 'deleted').length + journals.filter(j => (j as any).status === 'deleted').length + deletedIdeas.length}
                    </span>
                  )}
                </button>
              </div>

              {/* MODERN POPUP DRAWER/RECOVERY PANEL SCREEN */}
              {isRecycleBinOpen && (
                <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-[4px] z-50 flex items-center justify-center p-4 animate-fade-in text-stone-100 font-sans">
                  <div className="bg-[#1C1A17] border border-stone-800 p-5 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl relative">
                    <button 
                      onClick={() => { setIsRecycleBinOpen(false); setSelectedTrashKeys([]); }}
                      className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 hover:bg-stone-900 rounded-lg transition text-[9px] uppercase tracking-widest font-mono font-bold"
                    >
                      ✕ Close
                    </button>

                    <div className="border-b border-stone-850 pb-2.5">
                      <h3 className="font-serif text-sm font-bold text-stone-100 flex items-center gap-2">
                        ♻️ Our Recycle Bin
                      </h3>
                      <p className="text-[10px] text-[#7C7C59] font-mono uppercase tracking-wider font-extrabold block">
                        Rhonda & Susan's Recoverable Items
                      </p>
                    </div>

                    {/* Bulk recovery controls */}
                    <div className="grid grid-cols-2 gap-2 text-[8px] font-mono uppercase font-black">
                      <button
                        onClick={handleRestoreAll}
                        className="py-2 bg-stone-900 hover:bg-stone-850 text-stone-300 rounded-xl border border-stone-800 transition tracking-wider cursor-pointer"
                      >
                        Restore All
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Permanently empty the entire recycle bin? This cannot be undone.")) {
                            handleDeleteAllPermanently();
                          }
                        }}
                        className="py-2 bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/50 rounded-xl transition tracking-wider cursor-pointer"
                      >
                        Empty Bin
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[8px] font-mono uppercase font-black">
                      <button
                        disabled={selectedTrashKeys.length === 0}
                        onClick={() => handleRestoreSelected(selectedTrashKeys)}
                        className={`py-2 rounded-xl border transition tracking-wider cursor-pointer ${
                          selectedTrashKeys.length > 0
                            ? 'bg-amber-500 text-stone-950 border-amber-600 hover:bg-amber-600'
                            : 'bg-stone-950 text-stone-600 border-stone-900 cursor-not-allowed opacity-40'
                        }`}
                      >
                        Restore Selected ({selectedTrashKeys.length})
                      </button>
                      <button
                        disabled={selectedTrashKeys.length === 0}
                        onClick={() => {
                          if (confirm(`Permanently delete the ${selectedTrashKeys.length} selected items?`)) {
                            handlePermanentlyDeleteSelected(selectedTrashKeys);
                          }
                        }}
                        className={`py-2 rounded-xl border transition tracking-wider cursor-pointer ${
                          selectedTrashKeys.length > 0
                            ? 'bg-red-950/65 text-red-300 border-red-900 hover:bg-red-900/80'
                            : 'bg-stone-950 text-stone-600 border-stone-900 cursor-not-allowed opacity-40'
                        }`}
                      >
                        Delete Selected ({selectedTrashKeys.length})
                      </button>
                    </div>

                    {/* LIST VIEWPORT */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5 scrollbar-thin">
                      {(deletedTrips.length + photos.filter(p => (p as any).status === 'deleted').length + journals.filter(j => (j as any).status === 'deleted').length + deletedIdeas.length) === 0 ? (
                        <div className="py-10 text-center text-[10px] font-serif text-stone-500 italic block">
                          No items currently in Recycle Bin.
                        </div>
                      ) : (
                        <>
                          {/* Trips list */}
                          {deletedTrips.map(trip => {
                            const key = `trip-${trip.tripId}`;
                            const isChecked = selectedTrashKeys.includes(key);
                            return (
                              <div key={key} className="p-2 bg-stone-900/40 hover:bg-stone-900/80 border border-stone-850 rounded-xl flex items-start gap-2.5 text-stone-300 transition">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked} 
                                  onChange={() => toggleTrashSelect(key)} 
                                  className="mt-1 h-3.5 w-3.5 accent-amber-500 shrink-0 cursor-pointer"
                                />
                                <div className="min-w-0 flex-grow text-xs font-serif">
                                  <span className="text-[7.5px] font-mono text-red-400 uppercase tracking-widest font-black block">🗺️ Trip Blueprint</span>
                                  <strong className="text-stone-100 font-bold block truncate leading-tight">{trip.title}</strong>
                                  <span className="text-[9px] text-stone-500 font-mono block truncate">{trip.destination}</span>
                                </div>
                              </div>
                            );
                          })}

                          {/* Photos list */}
                          {photos.filter(p => (p as any).status === 'deleted').map(photo => {
                            const key = `photo-${photo.id}`;
                            const isChecked = selectedTrashKeys.includes(key);
                            return (
                              <div key={key} className="p-2 bg-stone-900/40 hover:bg-stone-900/80 border border-stone-850 rounded-xl flex items-start gap-2.5 text-stone-300 transition">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked} 
                                  onChange={() => toggleTrashSelect(key)} 
                                  className="mt-2.5 h-3.5 w-3.5 accent-amber-500 shrink-0 cursor-pointer"
                                />
                                <img src={photo.url} alt="trash raw" className="w-8 h-8 object-cover rounded border border-stone-850 shrink-0 mt-0.5" referrerPolicy="no-referrer" />
                                <div className="min-w-0 flex-grow text-xs font-serif">
                                  <span className="text-[7.5px] font-mono text-amber-500 uppercase tracking-widest font-black block">📸 Photo Memory</span>
                                  <p className="text-stone-300 italic truncate text-[9.5px] leading-tight">"{photo.caption || 'Captured snapshot'}"</p>
                                  <span className="text-[8px] text-stone-500 font-mono block">{photo.timestamp} • By {photo.addedBy}</span>
                                </div>
                              </div>
                            );
                          })}

                          {/* Journals list */}
                          {journals.filter(j => (j as any).status === 'deleted').map(journal => {
                            const key = `journal-${journal.id}`;
                            const isChecked = selectedTrashKeys.includes(key);
                            return (
                              <div key={key} className="p-2 bg-stone-900/40 hover:bg-stone-900/80 border border-stone-850 rounded-xl flex items-start gap-2.5 text-stone-300 transition">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked} 
                                  onChange={() => toggleTrashSelect(key)} 
                                  className="mt-1.5 h-3.5 w-3.5 accent-amber-500 shrink-0 cursor-pointer"
                                />
                                <div className="min-w-0 flex-grow text-xs font-serif">
                                  <span className="text-[7.5px] font-mono text-purple-400 uppercase tracking-widest font-black block">📝 Handwritten Journal</span>
                                  <p className="text-stone-300 line-clamp-2 text-[9.5px] leading-tight">"{journal.text}"</p>
                                  <span className="text-[8px] text-stone-500 font-mono block">By {journal.author}</span>
                                </div>
                              </div>
                            );
                          })}

                          {/* Ideas list */}
                          {deletedIdeas.map((idea, index) => {
                            const key = `idea-${idea.tripId}::${idea.text}`;
                            const isChecked = selectedTrashKeys.includes(key);
                            return (
                              <div key={key} className="p-2 bg-stone-900/40 hover:bg-stone-900/80 border border-stone-850 rounded-xl flex items-start gap-2.5 text-stone-300 transition">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked} 
                                  onChange={() => toggleTrashSelect(key)} 
                                  className="mt-1.5 h-3.5 w-3.5 accent-amber-500 shrink-0 cursor-pointer"
                                />
                                <div className="min-w-0 flex-grow text-xs font-serif">
                                  <span className="text-[7.5px] font-mono text-blue-400 uppercase tracking-widest font-black block">💡 Saved Idea</span>
                                  <p className="text-stone-300 line-clamp-2 text-[9.5px] leading-tight">"{idea.text}"</p>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* QUICK STOP RESULTS DISPLAY CARD ON HOME SCREEN */}
              {quickStopState && quickStopState.active && (
                <div className="w-full max-w-sm mx-auto p-4 bg-[#FAF9F5] border-2 border-[#D4C3B3] rounded-3xl space-y-3 shadow-lg animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-stone-600 bg-stone-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                      📍 Recommendation
                    </span>
                    <span className="text-[10px] font-mono text-[#7C7C59]">
                      Option {quickStopState.index + 1} of {quickStopState.results.length}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-stone-900 font-sans tracking-tight leading-snug">
                      {quickStopState.results[quickStopState.index]?.name}
                    </h4>
                    <p className="text-[11px] font-mono text-[#7C7C59] font-medium">
                      ✦ {quickStopState.results[quickStopState.index]?.distance.toFixed(1)} km away ({quickStopState.category})
                    </p>
                  </div>

                  <p className="text-[11.5px] text-stone-700 bg-stone-100/50 p-2.5 rounded-2xl leading-relaxed border border-stone-200/80">
                    "I found {quickStopState.results[quickStopState.index]?.name} {quickStopState.results[quickStopState.index]?.distance.toFixed(1)} km away. Would you like me to navigate there?"
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof fireAssistantEvent === 'function') {
                          fireAssistantEvent('NAVIGATION_REQUESTED');
                        }
                        const activePOI = quickStopState.results[quickStopState.index];
                        setActiveRouteTarget({
                          label: activePOI.name,
                          query: activePOI.query
                        });
                        setIsSimulatedRoutingActive(true);
                        setSimulatedDistance(activePOI.distance);
                        setQuickStopState(null);
                        hasAskedNavigationQuestionRef.current = false;
                        isFollowUpRef.current = false;
                        speakText("Starting navigation now.");
                        if (typeof fireAssistantEvent === 'function') {
                          fireAssistantEvent('NAVIGATION_STARTED');
                        }
                        setTimeout(() => {
                          launchDeviceNavigation(activePOI.name, activePOI.query);
                        }, 1500);
                      }}
                      className="py-2.5 px-1 bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-300 rounded-2xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 pointer-events-auto"
                    >
                      <span className="text-sm">👍</span>
                      <span className="text-[8.5px] font-sans font-bold text-emerald-800 uppercase tracking-wider">Navigate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const nextIdx = quickStopState.index + 1;
                        if (nextIdx < quickStopState.results.length) {
                          setQuickStopState({
                            ...quickStopState,
                            index: nextIdx
                          });
                          const nextPOI = quickStopState.results[nextIdx];
                          if (typeof fireAssistantEvent === 'function') {
                            fireAssistantEvent('PLACE_SELECTED');
                          }
                          const speakTextStr = `The next closest is ${nextPOI.name} ${nextPOI.distance.toFixed(1)} kilometres away. Would you like me to navigate there?`;
                          lastSuggestedLocationRef.current = {
                            name: nextPOI.name,
                            query: nextPOI.query,
                            info: speakTextStr
                          };
                          hasAskedNavigationQuestionRef.current = true;
                          isFollowUpRef.current = true;
                          speakText(speakTextStr, undefined, 'listening');
                          setSpeechFeedback(speakTextStr);
                        } else {
                          setQuickStopState(null);
                          hasAskedNavigationQuestionRef.current = false;
                          isFollowUpRef.current = false;
                          speakText("I couldn't find any other results nearby.");
                        }
                      }}
                      className="py-2.5 px-1 bg-stone-100 hover:bg-stone-200 border-2 border-stone-300 rounded-2xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 pointer-events-auto"
                    >
                      <span className="text-sm">⏭️</span>
                      <span className="text-[8.5px] font-sans font-bold text-stone-700 uppercase tracking-wider">Skip</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setQuickStopState(null);
                        hasAskedNavigationQuestionRef.current = false;
                        isFollowUpRef.current = false;
                        speakText("Cancelled search.");
                      }}
                      className="py-2.5 px-1 bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 rounded-2xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 pointer-events-auto"
                    >
                      <span className="text-sm">❌</span>
                      <span className="text-[8.5px] font-sans font-bold text-[#A94A4A] uppercase tracking-wider">Cancel</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TACTILE QUICK STOP PRESETS ON HOME SCREEN */}
              <div className="bg-white border-2 border-stone-200/80 rounded-3xl p-5 shadow-sm max-w-sm w-full mx-auto space-y-4 relative">
                <span className="text-[10px] font-mono text-[#7C7C59] uppercase tracking-widest font-black block text-center">
                  📍 Quick-Access Destinations
                </span>
                
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: "Coffee", icon: Coffee, category: "Coffee" },
                    { label: "Gas", icon: Fuel, category: "Gas" },
                    { label: "Thrift Store", icon: ShoppingBag, category: "Thrift Store" },
                    { label: "Grocery", icon: ShoppingCart, category: "Grocery" },
                    { label: "Food", icon: Utensils, category: "Food" },
                    { label: "Hiking", icon: Trees, category: "Hiking" },
                    { label: "Pharmacy", icon: Pill, category: "Pharmacy" },
                    { label: "Trail / Walking Trail", icon: Footprints, category: "Trail / Walking Trail" },
                    { label: "Rest Stop", icon: ParkingCircle, category: "Rest Stop" },
                    { label: "Hospital", icon: HospitalIcon, category: "Hospital" },
                    { label: "Beach", icon: Palmtree, category: "Beach" },
                  ].map(preset => {
                    const PresetIcon = preset.icon;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          handleQuickStopSearch(preset.category);
                        }}
                        className="h-[80px] bg-[#FAF9F5] hover:bg-[#F3F2EB] border border-[#E2DFD3] rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all focus:outline-none shadow-xs group pointer-events-auto"
                      >
                        <div className="w-9 h-9 rounded-full bg-white border border-stone-150 flex items-center justify-center text-[#5C5C43] group-hover:bg-amber-100/50 group-hover:text-amber-700 transition-colors shrink-0">
                          <PresetIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-serif font-black tracking-tight text-[#5C5C43] leading-none text-center truncate px-1 w-full">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DRIVE BANNER AT BOTTOM OF MAIN SECTIONS */}
              <div className="w-full max-w-sm mx-auto px-1 pt-2 text-left">
                <button
                  type="button"
                  onClick={() => setActiveScreen('drive')}
                  className="w-full py-3.5 px-4 bg-[#1E1C1A] border-2 border-[#2C2A26] rounded-2xl flex items-center justify-between shadow-lg cursor-pointer hover:bg-neutral-900 group"
                >
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-9 h-9 rounded-full bg-emerald-950/40 border border-emerald-950 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                      <Car className="w-4.5 h-4.5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-serif text-[12px] font-black tracking-wide text-[#ECE6DF] group-hover:text-emerald-400 transition-colors">
                        Start Roaming Mode
                      </h4>
                      <p className="font-mono text-[8.5px] text-[#7C7C59] tracking-tight">
                        Active route-aware co-pilot & hands-free assistant
                      </p>
                    </div>
                  </div>
                  <div className="h-6 w-6 rounded-lg bg-[#2C2A26] flex items-center justify-center text-stone-400 group-hover:bg-emerald-900 group-hover:text-emerald-200 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

            </div>

            {/* THE BOTTOM TABS WITH DYNAMIC COMPONENT PANEL */}
            <div className="w-full max-w-sm mx-auto bg-stone-50/50 rounded-2xl p-4 border border-stone-200/50 shadow-inner">
              
              {/* Interactive handwritten styled tabs */}
              <div className="flex justify-around items-center border-b border-stone-200/60 pb-2.5 mb-3 select-none">
                <button 
                  onClick={() => setActiveTab('photos')}
                  className={`font-hand text-[15px] pb-1 cursor-pointer transition-all ${
                    activeTab === 'photos' 
                      ? 'border-b-2 border-purple-600 text-[#7A24B8] font-bold scale-105' 
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  [Upload Photo]
                </button>
                <button 
                  onClick={() => setActiveTab('journal')}
                  className={`font-hand text-[15px] pb-1 cursor-pointer transition-all ${
                    activeTab === 'journal' 
                      ? 'border-b-2 border-purple-600 text-[#7A24B8] font-bold scale-105' 
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  [Write in Journal]
                </button>
                <button 
                  onClick={() => setActiveTab('trips')}
                  className={`font-hand text-[15px] pb-1 cursor-pointer transition-all ${
                    activeTab === 'trips' 
                      ? 'border-b-2 border-purple-600 text-[#7A24B8] font-bold scale-105' 
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  [Our Trips]
                </button>
              </div>

              {/* ACTIVE TAB PANEL VIEWPORT */}
              <div className="min-h-[140px] max-h-[220px] overflow-y-auto relative pr-1">
                
                {/* 1. UPLOAD PHOTOS COMPONTENT PANEL */}
                {activeTab === 'photos' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#7C7C59] uppercase tracking-wider block font-bold">
                        📸 Rhonda & Susan's Polaroids ({photos.length})
                      </span>
                      {/* Upload and Studio button group */}
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => startCamera()}
                          className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[9px] font-mono rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer transition font-bold"
                          title="Snap a new Polaroid memory"
                        >
                          <Camera className="w-3 h-3" /> Take Photo
                        </button>
                        <button 
                          onClick={() => photoUploadInputRef.current?.click()}
                          className="py-1 px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[9px] font-mono rounded-lg border border-purple-200 flex items-center gap-1 cursor-pointer transition"
                          title="Upload existing image"
                        >
                          <Upload className="w-3 h-3" /> Upload Image
                        </button>
                        <button 
                          onClick={() => setIsPhotoStudioOpen(true)}
                          className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[9px] font-mono rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer transition font-bold"
                          title="Open Polaroid Memory & Album Organization Studio"
                        >
                          <span>🗂️ Studio</span>
                        </button>
                      </div>
                      <input type="file" ref={photoUploadInputRef} accept="image/*" capture="environment" onChange={handleHomePhotoUpload} className="hidden" />
                    </div>

                    {photos.filter(p => (p as any).status !== 'deleted').length === 0 ? (
                      <div className="text-center py-6 text-stone-400 font-serif text-[11px] italic">
                        No polaroid memories collected yet. Collect beautiful sights!
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3.5 pt-1">
                        {photos.filter(p => (p as any).status !== 'deleted').map(p => {
                          const cStyle = getUserColorStyle(p.addedBy);
                          return (
                            <div 
                              key={p.id} 
                              className="bg-white p-2 pb-3.5 border shadow-md rounded-lg relative group transition-all hover:scale-[1.02]"
                              style={{ borderColor: cStyle.hex + '2e', borderBottomColor: cStyle.hex + '9a', borderBottomWidth: '4px' }}
                            >
                              
                              {/* THE MANDATORY garbage delete icon in the active tab panel */}
                              <button 
                                onClick={() => handleDeletePhoto(p.id)}
                                className="absolute top-1 right-1 p-1 bg-red-50 text-red-500 rounded-md hover:bg-red-100 cursor-pointer z-10 transition-opacity"
                                title="Delete photo memory"
                              >
                                <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                              </button>

                              <img 
                                src={p.url} 
                                alt={p.caption} 
                                className="w-full h-24 object-cover rounded shadow-inner" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="mt-2 flex items-center justify-between text-[8px] font-mono leading-none">
                                <span 
                                  className="truncate max-w-[80px] font-black px-1.5 py-0.5 rounded text-[7.5px]"
                                  style={{ backgroundColor: cStyle.hex + '1c', color: cStyle.hex }}
                                >
                                  {cStyle.displayName}
                                </span>
                                <span className="font-bold text-stone-400">{p.timestamp}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. JOURNALING COMPONENT PANEL */}
                {activeTab === 'journal' && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-[#7C7C59] uppercase tracking-wider block font-bold">
                      📝 Handwritten Travel Logs ({journals.filter(j => (j as any).status !== 'deleted').length})
                    </span>

                    {/* Simple write journal editor form */}
                    <form onSubmit={handleAddJournalSubmit} className="space-y-2 bg-white p-3 rounded-xl border border-stone-200 shadow-sm transition-all">
                      <textarea 
                        value={journalInputText} 
                        onChange={(e) => setJournalInputText(e.target.value)}
                        placeholder={`Write down an initial travel thought as ${getUserColorStyle(activeUser).displayName}...`}
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-[11px] font-serif text-stone-800 placeholder-stone-400 focus:outline-none min-h-[46px] resize-none"
                      />
                      <div className="flex justify-between items-center pr-1">
                        <span className="text-[8px] font-mono uppercase tracking-wider font-extrabold flex items-center gap-1" style={{ color: getUserColorStyle(activeUser).hex }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: getUserColorStyle(activeUser).hex }} />
                          Signing as {getUserColorStyle(activeUser).displayName}
                        </span>
                        <button 
                          type="submit"
                          className="py-1.5 px-3.5 text-white text-[9px] font-mono uppercase font-black rounded-lg cursor-pointer transition-all active:scale-95"
                          style={{ backgroundColor: getUserColorStyle(activeUser).hex }}
                        >
                          Save Log
                        </button>
                      </div>
                    </form>

                    {/* Journal lists with trash deletion trigger */}
                    <div className="space-y-2 pt-1">
                      {journals.filter(j => (j as any).status !== 'deleted').map(j => {
                        const cStyle = getUserColorStyle(j.author);
                        return (
                          <div 
                            key={j.id} 
                            className="p-3.5 bg-white border shadow-sm rounded-xl relative group transition-all hover:shadow"
                            style={{ borderColor: cStyle.hex + '1f', borderLeftColor: cStyle.hex, borderLeftWidth: '5px' }}
                          >
                            
                            {/* THE MANDATORY garbage delete icon in the active tab panel */}
                            <button 
                              onClick={() => handleDeleteJournal(j.id)}
                              className="absolute top-2 right-2 p-1 bg-red-50 text-red-500 rounded-md hover:bg-red-100 cursor-pointer z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete secret journal record"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                            </button>

                            <p className="text-[11.5px] font-serif text-stone-800 leading-relaxed pr-6 italic font-medium">
                              "{j.text}"
                            </p>
                            <div className="mt-2.5 px-0.5 flex items-center justify-between text-[8px] font-mono">
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cStyle.hex }} />
                                <span className="font-extrabold uppercase tracking-wider text-[7.5px]" style={{ color: cStyle.hex }}>
                                  Logged by {cStyle.displayName} ({cStyle.role})
                                </span>
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setNavigationTriggerSource({ label: `Journal Spot: "${j.text.slice(0, 20)}..."`, query: j.text })}
                                  className="text-stone-500 hover:text-emerald-700 font-extrabold flex items-center gap-0.5 cursor-pointer transition-colors"
                                  title="Map or GPS Routing co-pilot"
                                >
                                  <Navigation className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>Route</span>
                                </button>
                                <span className="text-stone-300">|</span>
                                <span className="text-stone-400 font-bold">{j.date}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. TRIP BLUEPRINTS PANEL */}
                {activeTab === 'trips' && (
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-[#7C7C59] uppercase tracking-wider block font-bold">
                      🗺️ Our Travel Blueprints ({trips.filter(t => t.status !== 'deleted').length})
                    </span>

                    <div className="space-y-2">
                      {trips.filter(t => t.status !== 'deleted').map(trip => (
                        <div 
                          key={trip.tripId} 
                          onClick={() => {
                            setActiveTripId(trip.tripId);
                            setActiveScreen('chat');
                          }}
                          className="p-3 bg-white hover:border-[#7C7C59]/40 border border-stone-200/80 shadow-sm rounded-xl flex items-start justify-between cursor-pointer transition relative group"
                        >
                          <div className="space-y-1">
                            <span className="font-serif font-black text-xs text-[#2C2C20] block transition-colors leading-tight">
                              {trip.title}
                            </span>
                            <div className="flex items-center gap-1 text-[9px] text-stone-400 font-mono leading-none">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{trip.destination}</span>
                              <span className="mx-0.5">•</span>
                              <Calendar className="w-2.5 h-2.5" />
                              <span>{trip.startDate}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-center">
                            <span className={`text-[7.5px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border leading-none font-bold ${
                              trip.status === 'current' 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                : trip.status === 'past' || trip.status === 'completed'
                                ? 'bg-stone-100 border-stone-200 text-stone-500'
                                : 'bg-[#7C7C59]/10 border-[#7C7C59]/30 text-[#5A5A40]'
                            }`}>
                              {trip.status === 'current' ? 'Live' : trip.status}
                            </span>

                            {/* Garbage delete icon triggering confirm modal */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setTripToDelete(trip);
                              }}
                              className="p-1 bg-red-50 text-red-500 rounded-md hover:bg-red-100 cursor-pointer z-10 opacity-70 group-hover:opacity-100 transition-opacity"
                              title="Move blueprint to Trash"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* THE TEXT INPUT BAR AT THE BOTTOM */}
            <div className="p-3.5 bg-white border border-stone-200 rounded-2xl max-w-sm w-full mx-auto shadow-lg space-y-2 z-10">
              
              {/* Interaction Mode Toggles (Keyboard Text Chat & Microphone Audio Combined) */}
              <div className="flex justify-center gap-2 pb-1 bg-stone-50 p-1 rounded-xl border border-stone-100">
                
                {/* 1. KEYBOARD ICON (Text Chat Mode) */}
                <button 
                  onClick={() => {
                    setProfile(prev => ({
                      ...prev,
                      settings: { ...prev.settings, responseMode: 'text' }
                    }));
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[9.5px] font-mono uppercase tracking-wider cursor-pointer ${
                    profile.settings.responseMode === 'text'
                      ? 'bg-[#3F3F2D] text-white font-extrabold shadow'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                  title="Enable Text Chat Mode ONLY (Keyboard)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Text Chat</span>
                </button>

                {/* 2. MICROPHONE ICON (Audio / Combined Mode) */}
                <button 
                  onClick={() => {
                    setProfile(prev => ({
                      ...prev,
                      settings: { ...prev.settings, responseMode: 'combined' }
                    }));
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[9.5px] font-mono uppercase tracking-wider cursor-pointer ${
                    profile.settings.responseMode === 'combined'
                      ? 'bg-[#7C7C59] text-[#141312] font-black shadow'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                  title="Enable Audio / Combined Mode"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Audio Speech</span>
                  {profile.settings.responseMode === 'combined' && (
                    <div className="flex items-center gap-0.5 ml-0.5">
                      <span className="w-0.5 h-2 bg-stone-900 rounded-full animate-pulse" />
                      <span className="w-0.5 h-3 bg-stone-900 rounded-full animate-pulse style-delay-100" />
                      <span className="w-0.5 h-1.5 bg-stone-900 rounded-full animate-pulse style-delay-200" />
                    </div>
                  )}
                </button>
              </div>

              {/* The actual Form dispatch input field */}
              <form onSubmit={handleHomeQuerySubmit} className="flex gap-2 items-center bg-stone-50 rounded-xl border border-stone-200/80 p-0.5 pl-2">
                <input 
                  type="text" 
                  value={homeInputText}
                  onChange={(e) => setHomeInputText(e.target.value)}
                  placeholder="Plan a new destination with Roamie..."
                  className="flex-grow p-2.5 bg-transparent text-xs font-serif text-stone-800 placeholder-stone-400 focus:outline-none"
                />

                <button 
                  type="submit"
                  className="py-2 px-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-[9px] font-black uppercase tracking-widest rounded-lg transition shrink-0 cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ---- SCREEN 2: CHAT SCREEN (PER TRIP) ---- */}
        {activeScreen === 'chat' && (
          <div className="flex-grow flex flex-col h-[calc(100vh-130px)] lg:h-[600px] animate-fade-in relative">
            
            {/* TRIP HEADER TOP BAR */}
            <div className="p-3 bg-[#1C1A17] border-b border-[#2C2A26] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleExitChat}
                  className="p-1 px-2.5 bg-[#2C2A26] hover:bg-neutral-800 text-stone-300 font-mono text-[9px] tracking-wider uppercase rounded-lg cursor-pointer max-h-8 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Exit</span>
                </button>
                <div>
                  <h3 className="font-serif text-xs font-bold text-[#fcfbfa] block truncate max-w-[150px] leading-tight">
                    {currentTrip.title}
                  </h3>
                  <span className="text-[8px] font-mono text-stone-400 leading-none">Destination: {currentTrip.destination}</span>
                </div>
              </div>

              {/* Chat action triggers */}
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setActiveScreen('itinerary')}
                  className="p-1 px-2 border border-stone-800 bg-[#2C2A26] hover:bg-stone-800 text-[#EBE6E0] font-mono text-[9px] uppercase tracking-wider rounded-lg flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>Itinerary</span>
                </button>

                <button 
                  onClick={toggleMuteOption}
                  className={`p-1 px-2 border rounded-lg font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 ${
                    profile.settings.responseMode === 'text' 
                      ? 'bg-red-950/30 border-red-900 text-red-400' 
                      : 'bg-[#2C2A26] border-stone-800 text-emerald-400'
                  }`}
                >
                  {profile.settings.responseMode === 'text' ? (
                    <>
                      <VolumeX className="w-3 h-3" />
                      <span>Muted</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 animate-pulse" />
                      <span>Sound On</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* CHAT MESSAGES PANEL */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#141312]">
              {isApiKeyExpiredAlert && (
                <div role="alert" className="p-3 bg-amber-950/15 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-left mb-2.5 animate-fade-in text-[#FAF9F5]">
                  <span className="text-xs shrink-0 mt-0.5 leading-none">⚠️</span>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-amber-400 leading-none block">
                      Gemini API Key Expired
                    </span>
                    <p className="font-sans text-[10px] text-stone-300 leading-normal font-medium">
                      Roamie is operating smoothly via safe offline fallback intelligence because your workspace <code className="bg-stone-900 border border-stone-800 text-[9px] font-mono px-1 py-0.5 rounded text-amber-400">GEMINI_API_KEY</code> has expired or is invalid. Feel free to renew your credentials in the AI Studio Settings anytime!
                    </p>
                  </div>
                </div>
              )}
              {activeChat.messages.map((m, index) => {
                const isUser = m.role === 'user';
                const isRoamie = m.senderName === 'Roamie';
                const cStyle = getUserColorStyle(m.senderName);
                
                return (
                  <div key={m.id || index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Timestamp & author identity tags (Requirement 6) */}
                    <div className={`flex items-center gap-2 text-[8.5px] font-mono mb-1.5 px-1 ${isUser ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      {/* Rich Mini Avatar Badge (Requirement 6) */}
                      <span 
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0 shadow-sm border select-none font-sans"
                        style={{ 
                          backgroundColor: isRoamie ? '#7C7C59' : cStyle.hex,
                          borderColor: isRoamie ? '#5A5A40' : 'rgba(255,255,255,0.1)'
                        }}
                      >
                        {isRoamie ? 'R' : cStyle.displayName.toUpperCase().slice(0, 1)}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <span 
                          className={`font-black tracking-wider transition-colors ${
                            isRoamie ? 'text-stone-300' : ''
                          }`}
                          style={isRoamie ? {} : { color: cStyle.hex }}
                        >
                          {isRoamie ? 'Roamie' : cStyle.displayName}
                        </span>
                        {!isRoamie && (
                          <span className="text-[7.5px] text-stone-500 font-bold uppercase tracking-widest leading-none">
                            ({cStyle.role})
                          </span>
                        )}
                      </div>

                      <span className="text-stone-600 font-normal leading-none">•</span>
                      
                      <span className="text-stone-500 font-medium leading-none">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Speech bubble card with custom styles & customizable bubble options (Requirement 3, 5, 10) */}
                    <div 
                      className={`p-3.5 rounded-2xl text-stone-100 max-w-[85%] font-serif text-[11px] leading-relaxed shadow-lg border transition-all duration-300 ${
                        isRoamie 
                          ? 'bg-[#1E1C1A] border-[#2C2A26] rounded-tl-none' 
                          : isUser
                          ? `${cStyle.chatBubble} rounded-tr-none`
                          : `${cStyle.chatBubble} rounded-tl-none`
                      }`}
                      style={
                        isRoamie 
                          ? {} 
                          : cStyle.bubbleStyle === 'bordered'
                          ? { backgroundColor: '#141312', borderColor: cStyle.hex, borderWidth: '2px' }
                          : cStyle.bubbleStyle === 'playful'
                          ? { borderColor: cStyle.hex, borderBottomRightRadius: isUser ? '4px' : '20px', borderBottomLeftRadius: isUser ? '20px' : '4px' }
                          : { borderColor: cStyle.hex + '3a' } // Standard default styling with solid & slight colored border accent
                      }
                    >
                      <p className="whitespace-pre-line leading-relaxed">{m.content}</p>

                      {/* Display image inside speech bubble if passed */}
                      {m.photoUrl && (
                        <img 
                          src={m.photoUrl} 
                          alt="Stated visual media" 
                          className="mt-2 text-xs rounded-xl max-h-40 w-full object-cover border" 
                          style={{ borderColor: isRoamie ? '#2C2A26' : cStyle.hex + '35' }}
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 bg-[#1C1A17] max-w-[120px] rounded-xl border border-neutral-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[8px] font-mono text-stone-400 uppercase">typing</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* TEXT INPUT DISPATCH CORRIDOR */}
            <div className="p-3 bg-[#1C1A17] border-t border-[#2C2A26] space-y-2">
              
              {/* Optional pending attachment review */}
              {attachedImage && (
                <div className="p-2 bg-stone-900 border border-[#2C2A26] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={attachedImage} alt="Preview thumbnail" className="h-8 w-8 object-cover rounded" referrerPolicy="no-referrer" />
                    <span className="text-[10px] font-mono text-[#7C7C59]">Attached Pic Ready</span>
                  </div>
                  <button onClick={() => setAttachedImage(null)} className="p-1 px-2.5 bg-red-950/40 text-red-400 text-[9px] font-mono rounded">
                    Delete
                  </button>
                </div>
              )}

              {/* Speech transcription helper feedback */}
              {speechFeedback && (
                <div className="text-[9px] font-mono text-[#7C7C59] bg-[#141312] p-2 rounded-xl flex items-center justify-between border border-[#262421]">
                  <span>🎙️ {speechFeedback}</span>
                  <button onClick={() => setSpeechFeedback(null)} className="text-[8px] uppercase tracking-widest text-stone-500 hover:text-white">Clear</button>
                </div>
              )}

              {/* Chat action suggestion loops */}
              <div className="flex gap-1 overflow-x-auto py-1 scrollbar-hidden">
                <button 
                  onClick={() => dispatchQuickPrompt("What are 3 quiet gluten-free lunch spots near Lord Elgin?")}
                  className="px-2.5 py-1 bg-[#141312] border border-stone-800 text-stone-300 text-[8px] font-mono uppercase tracking-wider rounded-lg shrink-0 hover:bg-[#2C2A26]"
                >
                  ☕ Lunch suggestion
                </button>
                <button 
                  onClick={() => dispatchQuickPrompt("Can we schedule Day 1 evening to be incredibly cosy and simple?")}
                  className="px-2.5 py-1 bg-[#141312] border border-stone-800 text-stone-300 text-[8px] font-mono uppercase tracking-wider rounded-lg shrink-0 hover:bg-[#2C2A26]"
                >
                  🌲 Cozy evening
                </button>
                <button 
                  onClick={() => dispatchQuickPrompt("Suggest organic greenhouses details nearby.")}
                  className="px-2.5 py-1 bg-[#141312] border border-stone-800 text-stone-300 text-[8px] font-mono uppercase tracking-wider rounded-lg shrink-0 hover:bg-[#2C2A26]"
                >
                  🌸 Indoor plants garden
                </button>
              </div>

              {/* Form dispatch core input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <button 
                  type="button"
                  onClick={() => attachmentInputRef.current?.click()}
                  className="p-3 bg-[#141312] hover:bg-[#2C2A26] border border-[#2C2A26] text-stone-300 rounded-xl cursor-pointer"
                  title="Upload picture"
                >
                  <Image className="w-4 h-4" />
                </button>
                <input type="file" ref={attachmentInputRef} accept="image/*" capture="environment" onChange={handleMessageAttachFile} className="hidden" />

                {/* Speech recognizer target mic */}
                <button 
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-xl border transition-all ${
                    roamieState === 'listening' 
                      ? 'bg-rose-950/80 border-rose-600 text-rose-400 animate-pulse' 
                      : 'bg-[#141312] border-[#2C2A26] text-stone-300 hover:bg-[#2C2A26]'
                  }`}
                  title="Voice dictation input"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input 
                  type="text" 
                  value={chatInputs[activeTripId] || ''}
                  onChange={(e) => setChatInputs(prev => ({ ...prev, [activeTripId]: e.target.value }))}
                  placeholder={`Speak or write for Roamie to design ${currentTrip.title}...`}
                  className="flex-grow p-3 bg-[#141312] border border-[#2C2A26] rounded-xl text-xs font-serif text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-[#7C7C59]"
                />

                <button 
                  type="submit"
                  className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-stone-900 font-mono text-[9px] font-black uppercase tracking-widest rounded-xl transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ---- SCREEN 3: ITINERARY SCREEN ---- */}
        {activeScreen === 'itinerary' && (
          <div className="p-4 space-y-4 animate-fade-in text-xs">
            {/* Header navigator */}
            <div className="flex items-center justify-between border-b border-[#2C2A26] pb-2">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveScreen('home')}
                  className="p-1 px-2.5 bg-[#2C2A26] hover:bg-[#3F3F2D] font-mono text-[9px] uppercase tracking-wider text-stone-300 rounded-lg cursor-pointer"
                >
                  ← Home
                </button>
                <h3 className="font-serif font-black text-sm text-[#fcfbfa] truncate max-w-[200px]">
                  {currentTrip.title}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                {/* Switch view back to chat */}
                <button 
                  onClick={() => setActiveScreen('chat')}
                  className="p-1 px-2 pb-1.5 bg-[#5A5A40] text-[#141312] hover:bg-[#7C7C59] font-mono text-[9px] uppercase tracking-wider rounded-lg font-black cursor-pointer"
                >
                  💬 Speak to Roamie
                </button>
              </div>
            </div>

            {/* LOCK ITINERARY HIGHLIGHT */}
            <div className="p-3 bg-[#1C1A17] border border-[#3F3F2D]/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-stone-400 block">ITINERARY PLANNING STATION</span>
                <span className="text-[10px] font-serif text-[#7C7C59] italic block">Current status: {currentTrip.status}</span>
              </div>
              <button 
                onClick={() => toggleLockItinerary(currentTrip.tripId)}
                className={`py-1.5 px-3 rounded-lg font-mono text-[9px] font-bold uppercase tracking-wider transition ${
                  currentTrip.status === 'active' || currentTrip.status === 'planned'
                    ? 'bg-rose-950/45 text-rose-300 border border-rose-800' 
                    : 'bg-emerald-950/45 text-emerald-300 border border-emerald-800'
                }`}
              >
                {currentTrip.status === 'active' || currentTrip.status === 'planned' ? '🔓 Unlock Draft status' : '🔒 Lock itinerary'}
              </button>
            </div>

            {/* DAY TAB SELECTOR CHIPS */}
            <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-hidden border-b border-stone-800">
              {currentTrip.itinerary.days.map(d => (
                <button 
                  key={d.dayNumber}
                  onClick={() => setSelectedDayNum(d.dayNumber)}
                  className={`px-4 py-2 font-mono text-[10px] uppercase rounded-xl transition shrink-0 cursor-pointer ${
                    selectedDayNum === d.dayNumber 
                      ? 'bg-[#7C7C59] text-stone-900 font-extrabold' 
                      : 'bg-[#2C2A26] text-stone-400 hover:text-white'
                  }`}
                >
                  Day {d.dayNumber}
                </button>
              ))}

              <button 
                onClick={() => {
                  const newDayNum = currentTrip.itinerary.days.length + 1;
                  setTrips(prev => prev.map(t => {
                    if (t.tripId === currentTrip.tripId) {
                      const days = [...t.itinerary.days, {
                        dayNumber: newDayNum,
                        date: new Date(Date.now() + (newDayNum - 1) * 86400000).toISOString().split('T')[0],
                        activities: []
                      }];
                      return { ...t, itinerary: { days } };
                    }
                    return t;
                  }));
                  setSelectedDayNum(newDayNum);
                }}
                className="px-3 py-1.5 bg-[#1E1C1A] text-stone-400 hover:text-white rounded-xl font-mono text-[10px] uppercase border border-dashed border-[#5A5A40]/50 hover:border-stone-500 cursor-pointer"
              >
                + Add Day
              </button>
            </div>

            {/* DAY ACTIVITIES TIMELINE BLOCKS */}
            <div className="space-y-3 pt-2">
              {(() => {
                const dayData = currentTrip.itinerary.days.find(d => d.dayNumber === selectedDayNum);
                if (!dayData || dayData.activities.length === 0) {
                  return (
                    <div className="text-center py-10 bg-neutral-900/50 rounded-2xl border border-[#2C2A26] flex flex-col items-center justify-center text-stone-500">
                      <Clock className="w-8 h-8 text-stone-600 mb-2" />
                      <p className="font-serif italic text-xs">No active travel schedule blocks registered for this day.</p>
                      <button 
                        onClick={() => setShowAddActivityModal(true)}
                        className="mt-3 py-1.5 px-3 bg-[#7C7C59] hover:bg-[#5A5A40] text-neutral-900 font-mono text-[9px] uppercase font-black rounded-lg"
                      >
                        Create Activity Block
                      </button>
                    </div>
                  );
                }

                // Sorting day activities
                const orderMap: Record<string, number> = { morning: 1, afternoon: 2, evening: 3, custom: 4 };
                const sortedActivities = [...dayData.activities].sort((a, b) => 
                  (orderMap[a.time] || 9) - (orderMap[b.time] || 9)
                );

                return (
                  <div className="space-y-2.5">
                    {sortedActivities.map((act, ai) => {
                      const cStyle = act.addedBy ? getUserColorStyle(act.addedBy) : null;
                      return (
                        <div 
                          key={ai} 
                          className="p-4 rounded-xl border flex gap-3 relative transition-all"
                          style={
                            act.savedByAI 
                              ? { backgroundColor: 'rgba(120, 53, 4, 0.08)', borderColor: 'rgba(120, 53, 4, 0.4)' }
                              : cStyle 
                              ? { backgroundColor: '#1C1A17', borderColor: cStyle.hex + '40', borderLeftColor: cStyle.hex, borderLeftWidth: '4px' }
                              : { backgroundColor: '#1C1A17', borderColor: '#2C2A26' }
                          }
                        >
                          {act.savedByAI && (
                            <div className="absolute top-2.5 right-3 flex items-center gap-1 text-[8px] font-mono text-amber-500 font-bold tracking-widest uppercase">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>AI SAVED</span>
                            </div>
                          )}

                          {!act.savedByAI && cStyle && (
                            <div 
                              className="absolute top-2.5 right-3 flex items-center gap-1.5 text-[8px] font-mono font-bold tracking-wider rounded-full px-2 py-0.5 border"
                              style={{ 
                                backgroundColor: cStyle.hex + '1a', 
                                color: cStyle.hex, 
                                borderColor: cStyle.hex + '40'
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cStyle.hex }} />
                              <span>{cStyle.displayName}</span>
                            </div>
                          )}

                          <span className="text-[10px] font-mono uppercase bg-[#2C2C20] border border-[#3F3F2D]/55 h-fit px-2.5 py-1 rounded text-[#FAF7F2] font-black shrink-0">
                            {act.time}
                          </span>

                          <div className="space-y-1 flex-grow">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-serif text-[#ECE6DF] font-bold text-sm leading-tight">{act.title}</h4>
                              <button
                                onClick={() => setNavigationTriggerSource({ label: act.title, query: `${act.title}, ${currentTrip.destination}` })}
                                className="p-1 px-1.5 bg-[#1E1C1A] hover:bg-stone-900 border border-stone-800 hover:border-emerald-600/50 text-stone-300 hover:text-emerald-400 rounded-lg flex items-center gap-1 text-[8px] font-mono uppercase tracking-widest leading-none cursor-pointer shrink-0 transition"
                                title="Map & Routing Directions"
                              >
                                <Navigation className="w-2.5 h-2.5" />
                                <span>Route</span>
                              </button>
                            </div>
                            <p className="text-[11px] text-stone-400 font-serif leading-relaxed pr-8">{act.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* ACTION TRIGGERS AREA */}
            <div className="grid grid-cols-2 gap-2.5 pt-4">
              <button 
                onClick={() => {
                  setActiveScreen('chat');
                  dispatchQuickPrompt(`Can you suggest a beautiful set of calm activities or organic dining for Day ${selectedDayNum} of our Ottawa trip?`);
                }}
                className="py-2.5 bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 border border-amber-900/40 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer flex items-center justify-center gap-1"
              >
                🔄 Regenerate Day
              </button>

              <button 
                onClick={() => setShowAddActivityModal(true)}
                className="py-2.5 bg-[#2C2A26] hover:bg-stone-800 text-[#ECE6DF] rounded-xl border border-stone-800 font-mono text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer flex items-center justify-center gap-1"
              >
                ➕ Add Custom Suggestion
              </button>
            </div>

            {/* SAVED TRIP IDEAS BLOCK (Fulfill Cap) */}
            <div className="p-4 bg-gradient-to-r from-neutral-900 to-[#1C1A17] rounded-xl border border-[#2C2A26] space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-1 mr-2">
                <span className="font-serif text-xs font-bold text-stone-200 block">💡 Travel Saved Ideas Corridor</span>
                <span className="text-[9px] font-mono text-[#7C7C59] font-black uppercase">({currentTrip.savedIdeas.length})</span>
              </div>

              {currentTrip.savedIdeas.length === 0 ? (
                <p className="text-[10px] font-serif italic text-stone-500 py-2">No saved travel highlights yet. Dialogue with Roamie to collect ideas.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {currentTrip.savedIdeas.map((idea, idx) => {
                    const author = idea.addedBy || (idx % 2 === 0 ? 'Rhonda' : 'Susan');
                    const cStyle = getUserColorStyle(author);
                    return (
                      <div 
                        key={idx} 
                        className="p-2.5 bg-[#141312] border rounded-lg flex items-start justify-between transition-all"
                        style={{ borderColor: cStyle.hex + '1d', borderLeftColor: cStyle.hex, borderLeftWidth: '3.5px' }}
                      >
                        <div className="space-y-1 pr-3">
                          <p className="text-[10px] font-serif text-stone-200 leading-normal">"{idea.text}"</p>
                          <div className="flex items-center gap-1 text-[7.5px] font-mono">
                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: cStyle.hex }} />
                            <span style={{ color: cStyle.hex }} className="font-extrabold uppercase">
                              Saved by {cStyle.displayName}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          <button 
                            onClick={() => {
                              setNavigationTriggerSource({ label: idea.text, query: `${idea.text}, ${currentTrip.destination}` });
                            }}
                            className="p-1 text-stone-500 hover:text-emerald-400 transition cursor-pointer"
                            title="Route / Get Directions"
                          >
                            <Navigation className="w-3 h-3 text-emerald-600" />
                          </button>
                          <button 
                            onClick={() => {
                              const ideaText = idea.text;
                              setTrips(prev => prev.map(t => {
                                if (t.tripId === currentTrip.tripId) {
                                  const updatedInt = t.savedIdeas.filter((_, i) => i !== idx);
                                  return { ...t, savedIdeas: updatedInt };
                                }
                                return t;
                              }));
                              setDeletedIdeas(prev => [...prev, { tripId: currentTrip.tripId, text: ideaText, deletedAt: Date.now() }]);
                              setSuccessNotification("Moved saved item to Trash.");
                              setTimeout(() => setSuccessNotification(null), 3500);
                            }}
                            className="p-1 text-stone-600 hover:text-red-400 transition cursor-pointer"
                            title="Move to Trash"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add manual idea block */}
              <div className="pt-2">
                <input 
                  type="text" 
                  placeholder={`Record an instant idea as ${getUserColorStyle(activeUser).displayName}...`}
                  onKeyDown={(e) => {
                    const ideaText = e.currentTarget.value.trim();
                    if (e.key === 'Enter' && ideaText) {
                      setTrips(prev => prev.map(t => {
                        if (t.tripId === currentTrip.tripId) {
                          return {
                            ...t,
                            savedIdeas: [...t.savedIdeas, { text: ideaText, createdAt: Date.now(), addedBy: activeUser }]
                          };
                        }
                        return t;
                      }));
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full p-2 bg-[#141312] border text-[11px] text-stone-200 rounded-lg placeholder-stone-600 focus:outline-none focus:ring-1"
                  style={{ 
                    borderColor: getUserColorStyle(activeUser).hex + '5a',
                    focusWithinRingColor: getUserColorStyle(activeUser).hex
                  }}
                />
                <span className="text-[7.5px] font-mono text-stone-500 uppercase tracking-wider block mt-1">Press enter to record idea to {getUserColorStyle(activeUser).displayName}'s catalog</span>
              </div>
            </div>

            {/* TRIP CO-COPILOT SCRAPBOOK ATTACHMENT TIMELINE AREA */}
            <div className="p-4 bg-[#1C1A17] border border-[#2C2A26] rounded-xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-stone-800 pb-1">
                <span className="font-serif text-xs font-bold text-stone-200 block">📸 Trip Scrapbook Timeline & Board</span>
                <span className="text-[9px] font-mono text-[#7C7C59] font-black uppercase">
                  ({photos.filter(p => p.tripId === currentTrip.tripId && p.status !== 'deleted').length})
                </span>
              </div>

              {/* ACTION SNAP BUTTONS (Camera + Upload + Studio) */}
              <div className="flex items-center justify-between pb-1">
                <span className="text-[8px] font-mono text-stone-500 uppercase tracking-widest block">Instant Trip Captures</span>
                <div className="flex gap-1.5 animate-fade-in">
                  <button 
                    onClick={startCamera}
                    className="py-1 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[9px] font-mono rounded-lg flex items-center gap-1 cursor-pointer transition uppercase font-bold"
                  >
                    <Camera className="w-3.5 h-3.5" /> Take Polaroid
                  </button>
                  <button 
                    onClick={() => photoUploadInputRef.current?.click()}
                    className="py-1 px-2 bg-purple-700 hover:bg-purple-800 text-white text-[9px] font-mono rounded-lg flex items-center gap-1 cursor-pointer transition uppercase font-bold text-center"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Image
                  </button>
                  <button 
                    onClick={() => {
                      setActiveStudioAlbumId('all');
                      setIsPhotoStudioOpen(true);
                    }}
                    className="py-1 px-2 bg-stone-805 hover:bg-stone-850 text-emerald-450 text-[9px] font-mono border border-stone-800 rounded-lg flex items-center gap-1 cursor-pointer transition uppercase font-bold text-center"
                    title="Manage Album boards, bulk action transfer & multi-delete"
                  >
                    <span>Studio 🗂️</span>
                  </button>
                </div>
              </div>

              {/* GRID / ROW OF POLAROID PHOTOS */}
              {(() => {
                const tripPhotos = photos.filter(p => p.tripId === currentTrip.tripId && p.status !== 'deleted');
                if (tripPhotos.length === 0) {
                  return (
                    <div className="py-6 text-center text-[10px] font-serif italic text-stone-500 border border-dashed border-stone-800/80 rounded-xl space-y-1">
                      <p>No trip polaroids captured for {currentTrip.destination} yet.</p>
                      <p className="text-[8.5px] font-mono text-stone-550">Use the viewfinder to snap or import memories instantly.</p>
                    </div>
                  );
                }

                return (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hidden">
                    {tripPhotos.map((p, idx) => {
                      const cStyle = getUserColorStyle(p.addedBy);
                      return (
                        <div 
                          key={p.id || idx}
                          onClick={() => setSelectedPhotoForDetail(p)}
                          className="bg-stone-100 hover:bg-white text-stone-900 border border-stone-200 shadow-md p-2 rounded-lg shrink-0 w-36 cursor-pointer transition-all hover:-rotate-1 hover:scale-103 duration-250 animate-fade-in"
                        >
                          {/* Image box */}
                          <div className="relative aspect-square w-full bg-neutral-200 overflow-hidden rounded border border-stone-200 animate-pulse">
                            <img 
                              src={p.url} 
                              alt={p.caption} 
                              className="w-full h-full object-cover"
                            />
                            {/* Author Dot */}
                            <div className="absolute top-1.5 left-1.5 bg-black/55 backdrop-blur-sm px-1.5 py-0.5 rounded text-[7px] font-mono text-white flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cStyle.hex }} />
                              <span>{cStyle.displayName}</span>
                            </div>
                          </div>

                          {/* Polaroid Bottom Signature */}
                          <div className="pt-2">
                            <p className="font-serif italic text-[9px] text-stone-800 truncate leading-tight font-bold">
                              "{p.caption}"
                            </p>
                            <span className="text-[7px] font-mono text-stone-500 block mt-1 tracking-wider uppercase truncate">
                              📍 {p.location || 'Nova Scotia'} • {p.timestamp || '02:40 PM'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* ---- SCREEN 4: ROAMING TRAVEL CO-PILOT MODE ---- */}
        {activeScreen === 'drive' && (
          <div className="relative flex-grow flex flex-col min-h-[580px] overflow-hidden bg-[#FAF9F5]/40 text-stone-900 select-none pb-12 animate-fade-in">
            
            {/* Cloned Home screen layout in background - blurred & dimmed for perfect contexts parity */}
            <div className="absolute inset-0 filter blur-md opacity-25 select-none pointer-events-none p-4 space-y-6 flex flex-col justify-between">
              <div className="h-1" />
              <div className="flex flex-col items-center justify-center text-center space-y-4 pt-1">
                <div className="w-20 h-20 rounded-full bg-stone-300" />
                <div className="space-y-1">
                  <h1 className="font-serif italic font-extrabold text-3xl text-stone-400">Roamie</h1>
                </div>
              </div>
              <div className="bg-white border-2 border-stone-200 rounded-3xl h-60 flex items-center justify-center p-6 mx-auto max-w-sm w-full">
                <Compass className="w-10 h-10 text-stone-200 mx-auto" />
              </div>
              <div className="h-12 w-full max-w-sm mx-auto bg-stone-200 rounded-2xl" />
            </div>

            {/* HIGHLY COMPREHENSIVE GORGEOUS VOICE OVERLAY CONTAINER */}
            <div className="relative z-10 flex-grow flex flex-col justify-between p-6 bg-stone-950/95 backdrop-blur-[6px] text-stone-100 min-h-[550px]">
              
              {/* TOP STATUS BAR CONTAINER */}
              <div className="flex items-center justify-between border-b border-stone-850 pb-3.5 mx-auto max-w-sm w-full">
                <div className="flex items-center gap-2">
                  {profile.branding.logoUrl && (
                    <img 
                      src={profile.branding.logoUrl} 
                      alt="Roaming Story" 
                      className="h-6 w-auto object-contain mr-1 shadow-sm rounded-sm" 
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      roamieState === 'listening' ? 'bg-red-500' : roamieState === 'processing' ? 'bg-[#7C7C59]' : roamieState === 'speaking' ? 'bg-amber-500' : 'bg-stone-600'
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${
                      roamieState === 'listening' ? 'bg-red-400' : roamieState === 'processing' ? 'bg-[#7C7C59]' : roamieState === 'speaking' ? 'bg-amber-400' : 'bg-stone-500'
                    }`}></span>
                  </div>
                </div>
                
                {/* Active speaker identification pill (Requirement 1, 2, 5) */}
                <div 
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-mono uppercase tracking-wider font-extrabold border shrink-0"
                  style={{ 
                    backgroundColor: getUserColorStyle(activeUser).hex + '1a', 
                    borderColor: getUserColorStyle(activeUser).hex + '40',
                    color: getUserColorStyle(activeUser).hex
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getUserColorStyle(activeUser).hex }} />
                  {getUserColorStyle(activeUser).displayName}
                </div>
              </div>

              {/* CENTRAL SPEECH ANCHOR FRAME */}
              <div className="flex flex-col items-center justify-center space-y-6 py-6 flex-grow">

                {/* PERSISTENT ROAMING ROUTE HUD CARD */}
                <div className="w-full max-w-sm mx-auto bg-[#141211] border border-stone-800 rounded-2xl p-4.5 space-y-4 shadow-xl text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-stone-900/25 rounded-full filter blur-xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between border-b border-stone-900 pb-2">
                    <span className="text-[8px] font-mono text-[#7C7C59] uppercase tracking-widest font-black flex items-center gap-1">
                      <Compass className="w-3 h-3 text-[#7C7C59]" />
                      <span>Route-Aware Active Co-pilot</span>
                    </span>
                    <span className="text-[7.5px] font-mono bg-[#1E1C1A] text-stone-400 px-2 py-0.5 rounded-full border border-stone-850">
                      Active
                    </span>
                  </div>

                  {/* Route points info stack */}
                  <div className="grid grid-cols-1 gap-2.5 text-xs">
                    {/* Origin */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full border border-emerald-400 bg-emerald-500/20 shrink-0" />
                      <div className="flex-grow min-w-0 flex items-center justify-between gap-1">
                        <span className="text-[8px] font-mono text-stone-500 uppercase tracking-wider shrink-0 w-16">Origin:</span>
                        <input
                          type="text"
                          value={roamingOrigin}
                          onChange={(e) => setRoamingOrigin(e.target.value)}
                          className="flex-grow min-w-0 font-serif text-[11.5px] text-stone-200 bg-transparent hover:bg-stone-900/40 focus:bg-[#1C1A17] focus:border-stone-850 focus:ring-0 border-0 border-b border-transparent hover:border-stone-805 py-0.5 px-1 rounded transition-all focus:outline-none"
                          placeholder="Set start location..."
                          title="Click to edit Origin"
                        />
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full border border-rose-400 bg-rose-500/20 shrink-0" />
                      <div className="flex-grow min-w-0 flex items-center justify-between gap-1">
                        <span className="text-[8px] font-mono text-stone-500 uppercase tracking-wider shrink-0 w-16">Dest:</span>
                        <input
                          type="text"
                          value={roamingDestination}
                          onChange={(e) => setRoamingDestination(e.target.value)}
                          className="flex-grow min-w-0 font-serif text-[11.5px] text-stone-200 bg-transparent hover:bg-stone-900/40 focus:bg-[#1C1A17] focus:border-stone-850 focus:ring-0 border-0 border-b border-transparent hover:border-stone-805 py-0.5 px-1 rounded transition-all focus:outline-none"
                          placeholder="Set destination..."
                          title="Click to edit Destination"
                        />
                      </div>
                    </div>

                    {/* Current position */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded bg-amber-500/20 border border-amber-400 shrink-0" />
                      <div className="flex-grow min-w-0 flex items-center justify-between gap-1">
                        <span className="text-[8px] font-mono text-stone-500 uppercase tracking-wider shrink-0 w-16">Location:</span>
                        <input
                          type="text"
                          value={roamingCurrentPosition}
                          onChange={(e) => setRoamingCurrentPosition(e.target.value)}
                          className="flex-grow min-w-0 font-serif text-[11.5px] text-stone-200 bg-transparent hover:bg-stone-900/40 focus:bg-[#1C1A17] focus:border-stone-850 focus:ring-0 border-0 border-b border-transparent hover:border-stone-805 py-0.5 px-1 rounded transition-all focus:outline-none"
                          placeholder="Set current position..."
                          title="Click to edit Current Position"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE GPS NAVIGATION TARGET DETAILED VIEW */}
                  {activeRouteTarget ? (
                    <div className="bg-[#1C1A17]/70 border border-emerald-900/40 rounded-xl p-3 space-y-2.5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[7.2px] font-mono text-emerald-400 uppercase tracking-widest font-black flex items-center gap-1 leading-none">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            <span>Navigating to</span>
                          </span>
                          <h4 className="font-serif text-[11.5px] font-bold text-stone-100 leading-none">
                            {activeRouteTarget.label}
                          </h4>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-xs font-black text-emerald-400 block leading-none">
                            {simulatedDistance > 0 ? `${simulatedDistance} km` : 'Arrived'}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full h-1 bg-stone-950 rounded-full overflow-hidden border border-stone-850">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, Math.max(5, (1 - simulatedDistance / 6.5) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Maps links */}
                      <div className="flex items-center justify-between text-[7px] font-mono text-stone-400 select-none pb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-stone-500">Links:</span>
                          <button 
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeRouteTarget.query)}`, '_blank')}
                            className="hover:text-white transition cursor-pointer font-bold pr-1 border-r border-stone-800"
                          >
                            Google
                          </button>
                          <button 
                            onClick={() => window.open(`https://maps.apple.com/?q=${encodeURIComponent(activeRouteTarget.query)}`, '_blank')}
                            className="hover:text-white transition cursor-pointer font-bold pr-1 border-r border-stone-800"
                          >
                            Apple
                          </button>
                          <button 
                            onClick={() => window.open(`https://waze.com/ul?q=${encodeURIComponent(activeRouteTarget.query)}`, '_blank')}
                            className="hover:text-white transition cursor-pointer font-bold"
                          >
                            Waze
                          </button>
                        </div>
                        <button 
                          onClick={() => {
                            setActiveRouteTarget(null);
                            setIsSimulatedRoutingActive(false);
                            setSuccessNotification("Navigation cancelled.");
                            setTimeout(() => setSuccessNotification(null), 3000);
                          }}
                          className="text-red-400 hover:text-red-300 font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#1C1A17]/30 border border-stone-900 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] font-serif text-stone-400 italic">
                        No active GPS destination set. Tap a shortcut below or tell Roamie to navigate someplace!
                      </p>
                    </div>
                  )}
                </div>

                {/* ROAMIE CHARACTER BRANDING AVATAR WITH RADAR INDICATORS */}
                <div className="relative flex items-center justify-center">
                  {/* Visual state-driven ring layouts */}
                  {roamieState === 'idle' && (
                    <>
                      <div className="absolute w-48 h-48 rounded-full border border-dashed border-stone-800 animate-pulse duration-3000" />
                      <div className="absolute w-40 h-40 rounded-full border border-stone-900" />
                      <div className="absolute w-32 h-32 rounded-full bg-stone-900/40 blur-lg" />
                    </>
                  )}
                  {roamieState === 'listening' && (
                    <>
                      <div className="absolute w-52 h-52 rounded-full border-2 border-dashed border-rose-500/30 animate-spin" style={{ animationDuration: '10s' }} />
                      <div className="absolute w-44 h-44 rounded-full border border-rose-800/40 animate-ping duration-1500" />
                      <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-rose-950/40 to-orange-950/20 blur-xl scale-110" />
                    </>
                  )}
                  {roamieState === 'processing' && (
                    <>
                      <div className="absolute w-52 h-52 rounded-full border border-[#7C7C59]/45 animate-spin" style={{ animationDuration: '4s' }} />
                      <div className="absolute w-44 h-44 rounded-full border-2 border-dashed border-[#7C7C59]/30 duration-1000" />
                      <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-[#7C7C59]/30 to-emerald-950/20 blur-2xl scale-125" />
                    </>
                  )}
                  {roamieState === 'speaking' && (
                    <>
                      <div className="absolute w-52 h-52 rounded-full border border-amber-500/40 animate-ping duration-3000" />
                      <div className="absolute w-44 h-44 rounded-full border border-amber-500/35" />
                      <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-amber-950/45 to-amber-900/10 blur-xl scale-110 animate-pulse" />
                    </>
                  )}
                  
                  <button 
                    type="button"
                    onClick={toggleListening}
                    className="relative z-10 p-0.5 bg-[#1E1C1A] rounded-full border-4 border-stone-800 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-2xl focus:outline-none"
                    aria-label="Toggle Roamie handsfree voice assistant"
                  >
                    <RoamieAvatar 
                      size="xl" 
                      imgSrc={profile.branding.avatarUrl} 
                      isListening={roamieState === 'listening'} 
                      isSpeaking={roamieState === 'speaking' || speakingMsgId !== null} 
                    />
                  </button>
                  
                  {/* Large tactile Assistant State Badge */}
                  <span className={`absolute -bottom-2.5 px-4 py-1.5 rounded-full text-[9px] font-mono uppercase tracking-widest font-black shadow-2xl border transition-all duration-300 ${
                    roamieState === 'listening' 
                      ? 'bg-rose-950 border-rose-600 text-rose-300 animate-pulse'
                      : roamieState === 'processing'
                      ? 'bg-[#7C7C59]/95 border-[#7C7C59]/20 text-stone-200'
                      : roamieState === 'speaking'
                      ? 'bg-amber-950 border-amber-600 text-amber-300 animate-pulse'
                      : 'bg-stone-900 border-stone-800 text-stone-400'
                  }`}>
                    {roamieState === 'listening' ? '● LISTENING' : roamieState === 'processing' ? '⚙ PROCESSING' : roamieState === 'speaking' ? '🗣 SPEAKING' : '😴 ROAMIE IDLE'}
                  </span>
                </div>

                {/* SINGLE INTERACTION CHAT FEEDBACK BOX */}
                <div className="w-full max-w-sm mx-auto bg-neutral-900 border border-stone-800/90 p-5 rounded-2xl min-h-[96px] flex flex-col justify-center text-center shadow-inner relative overflow-hidden">
                  <span className="absolute top-2.5 left-3.5 text-[8px] font-mono text-[#7C7C59] uppercase tracking-wider block font-black">
                    Voice Dialogue Monitor:
                  </span>
                  
                  <p className="text-xs font-serif text-stone-100 leading-normal font-medium tracking-wide pt-3 px-1">
                    {roamieState === 'idle' ? (
                      <span className="text-stone-400">Roamie is asleep to protect battery and driving sounds. Say <strong className="text-white text-xs whitespace-nowrap font-mono font-bold font-serif underline decoration-[#7C7C59] decoration-2">"Hey Roamie"</strong> to wake me up!</span>
                    ) : speechFeedback ? (
                      `"${speechFeedback}"`
                    ) : (
                      "Awaiting Susan & Rhonda's query..."
                    )}
                  </p>
                </div>

                {/* ROUTE-AWARE GPS SUGGESTED POIS SELECTION OVERLAY */}
                {suggestedPois && suggestedPois.isPendingGps && (
                  <div className="w-full max-w-sm mx-auto bg-stone-900 border-2 border-[#7C7C59]/55 rounded-2xl p-4.5 space-y-3 shadow-2xl animate-fade-in relative z-20 text-left">
                    <div className="flex items-center justify-between border-b border-stone-850 pb-2">
                      <span className="text-[9.5px] font-mono text-[#7C7C59] uppercase tracking-widest font-black flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-[#7C7C59]" />
                        <span>Route Corridor POIs Found</span>
                      </span>
                      <button 
                        onClick={() => {
                          setSuggestedPois(null);
                        }}
                        className="text-stone-500 hover:text-stone-300 text-[9px] font-mono uppercase bg-stone-950 px-2 py-0.5 rounded border border-stone-850 hover:bg-stone-900 cursor-pointer"
                      >
                        Ignore
                      </button>
                    </div>

                    <p className="text-[10px] font-serif italic text-stone-300">
                      Would you like to add one of these to your GPS route?
                    </p>

                    <div className="space-y-2">
                      {/* Option 1: Closest on route */}
                      {suggestedPois.closestOnRoute.name && (
                        <button
                          type="button"
                          onClick={() => {
                            const name = suggestedPois.closestOnRoute.name;
                            setActiveRouteTarget({
                              label: name,
                              query: `${name}, Nova Scotia`
                            });
                            setIsSimulatedRoutingActive(true);
                            setSimulatedDistance(parseFloat(suggestedPois.closestOnRoute.detour) || 3.2);
                            setSuggestedPois(null);
                            speakText(`Okay, adding it to your route now. Transferring ${name} coordinates to vehicle navigation.`);
                            setSuccessNotification(`GPS routing updated to ${name}.`);
                            setTimeout(() => setSuccessNotification(null), 3000);
                          }}
                          className="w-full p-2.5 bg-[#1E1C1A] hover:bg-stone-800 border border-[#7C7C59]/20 rounded-xl text-left flex items-start justify-between gap-1 group cursor-pointer transition-all"
                        >
                          <div className="min-w-0">
                            <span className="text-[8px] font-mono text-[#7C7C59] block uppercase font-bold">1. Closest on route (Detour: {suggestedPois.closestOnRoute.detour} min)</span>
                            <span className="text-xs font-bold text-white group-hover:text-amber-300 truncate block leading-tight">{suggestedPois.closestOnRoute.name}</span>
                          </div>
                          <span className="bg-emerald-900/35 border border-emerald-800/40 text-emerald-400 text-[8px] font-mono px-1.5 py-0.5 rounded uppercase shrink-0 self-center">Add to GPS</span>
                        </button>
                      )}

                      {/* Option 2: Next closest */}
                      {suggestedPois.nextClosest && (
                        <button
                          type="button"
                          onClick={() => {
                            const name = suggestedPois.nextClosest;
                            setActiveRouteTarget({
                              label: name,
                              query: `${name}, Nova Scotia`
                            });
                            setIsSimulatedRoutingActive(true);
                            setSimulatedDistance(4.8);
                            setSuggestedPois(null);
                            speakText(`Okay, adding it to your route now. Transferring ${name} coordinates to vehicle navigation.`);
                            setSuccessNotification(`GPS routing updated to ${name}.`);
                            setTimeout(() => setSuccessNotification(null), 3000);
                          }}
                          className="w-full p-2.5 bg-[#1E1C1A] hover:bg-stone-800 border border-stone-800 rounded-xl text-left flex items-start justify-between gap-1 group cursor-pointer transition-all"
                        >
                          <div className="min-w-0">
                            <span className="text-[8px] font-mono text-stone-500 block uppercase font-bold">2. Next closest</span>
                            <span className="text-xs font-bold text-white group-hover:text-amber-300 truncate block leading-tight">{suggestedPois.nextClosest}</span>
                          </div>
                          <span className="bg-emerald-950 border border-stone-850 text-stone-300 text-[8px] font-mono px-1.5 py-0.5 rounded uppercase shrink-0 self-center">Add to GPS</span>
                        </button>
                      )}

                      {/* Option 3-X: Other nearby options */}
                      {suggestedPois.otherOptions && suggestedPois.otherOptions.length > 0 && (
                        <div className="space-y-1 pt-1.5 border-t border-stone-800">
                          <span className="text-[7.5px] font-mono text-stone-500 uppercase tracking-widest block font-bold mb-1">Other Alternatives:</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {suggestedPois.otherOptions.slice(0, 2).map((optName, oIdx) => (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => {
                                  setActiveRouteTarget({
                                    label: optName,
                                    query: `${optName}, Nova Scotia`
                                  });
                                  setIsSimulatedRoutingActive(true);
                                  setSimulatedDistance(5.7);
                                  setSuggestedPois(null);
                                  speakText(`Okay, adding it to your route now. Transferring ${optName} coordinates to vehicle navigation.`);
                                  setSuccessNotification(`GPS routing updated to ${optName}.`);
                                  setTimeout(() => setSuccessNotification(null), 3000);
                                }}
                                className="p-2 bg-[#141211] hover:bg-stone-850 border border-stone-850 rounded-lg text-left truncate text-[10px] font-bold text-stone-300 hover:text-white cursor-pointer transition-all"
                              >
                                {optName}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* QUICK STOP RESULTS DISPLAY CARD */}
                {quickStopState && quickStopState.active && (
                  <div className="w-full max-w-sm mx-auto p-3.5 bg-[#2A231C] border border-[#7C5C39]/40 rounded-2xl space-y-3 shadow-xl animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-[#D7B17D] bg-[#221C16] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                        Quick Stop Recommendation
                      </span>
                      <span className="text-[9px] font-mono text-[#7C7C59]">
                        Option {quickStopState.index + 1} of {quickStopState.results.length}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-stone-100 font-sans tracking-tight leading-snug">
                        {quickStopState.results[quickStopState.index]?.name}
                      </h4>
                      <p className="text-[11px] font-mono text-[#A4A48A]">
                        ✦ {quickStopState.results[quickStopState.index]?.distance.toFixed(1)} km away ({quickStopState.category})
                      </p>
                    </div>

                    <p className="text-[10px] text-stone-300 italic bg-[#1E1914] p-2 rounded-lg leading-relaxed border border-stone-800/40">
                      "{quickStopState.results[quickStopState.index]?.name} matches Susan's flat walking preferences. Shall I launch navigate directions?"
                    </p>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof fireAssistantEvent === 'function') {
                            fireAssistantEvent('NAVIGATION_REQUESTED');
                          }
                          const activePOI = quickStopState.results[quickStopState.index];
                          setActiveRouteTarget({
                            label: activePOI.name,
                            query: activePOI.query
                          });
                          setIsSimulatedRoutingActive(true);
                          setSimulatedDistance(activePOI.distance);
                          setQuickStopState(null);
                          hasAskedNavigationQuestionRef.current = false;
                          isFollowUpRef.current = false;
                          speakText("Starting navigation now.");
                          if (typeof fireAssistantEvent === 'function') {
                            fireAssistantEvent('NAVIGATION_STARTED');
                          }
                          setTimeout(() => {
                            launchDeviceNavigation(activePOI.name, activePOI.query);
                          }, 1500);
                        }}
                        className="py-2.5 px-1 bg-[#4C754A]/30 hover:bg-[#4C754A]/50 border border-[#5CA459]/40 rounded-xl flex flex-col items-center justify-center gap-0.5 pointer-events-auto cursor-pointer transition-all active:scale-95"
                      >
                        <span className="text-xs">👍</span>
                        <span className="text-[7.5px] font-mono font-bold text-[#A5CBA2] uppercase tracking-wider">Navigate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const nextIdx = quickStopState.index + 1;
                          if (nextIdx < quickStopState.results.length) {
                            setQuickStopState({
                              ...quickStopState,
                              index: nextIdx
                            });
                            const nextPOI = quickStopState.results[nextIdx];
                            if (typeof fireAssistantEvent === 'function') {
                              fireAssistantEvent('PLACE_SELECTED');
                            }
                            const speakTextStr = `The next closest is ${nextPOI.name} ${nextPOI.distance.toFixed(1)} kilometres away. Would you like me to navigate there?`;
                            lastSuggestedLocationRef.current = {
                              name: nextPOI.name,
                              query: nextPOI.query,
                              info: speakTextStr
                            };
                            hasAskedNavigationQuestionRef.current = true;
                            isFollowUpRef.current = true;
                            speakText(speakTextStr, undefined, 'listening');
                            setSpeechFeedback(speakTextStr);
                          } else {
                            setQuickStopState(null);
                            hasAskedNavigationQuestionRef.current = false;
                            isFollowUpRef.current = false;
                            speakText("I couldn't find any more results nearby. Expand search area?");
                          }
                        }}
                        className="py-2.5 px-1 bg-stone-850 hover:bg-stone-800 border border-stone-750 rounded-xl flex flex-col items-center justify-center gap-0.5 pointer-events-auto cursor-pointer transition-all active:scale-95"
                      >
                        <span className="text-xs">⏭️</span>
                        <span className="text-[7.5px] font-mono font-bold text-stone-300 uppercase tracking-wider">Skip</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setQuickStopState(null);
                          hasAskedNavigationQuestionRef.current = false;
                          isFollowUpRef.current = false;
                          speakText("Disrupt search. Holding course coordinates.");
                        }}
                        className="py-2.5 px-1 bg-[#5A2C2C]/30 hover:bg-[#5A2C2C]/50 border border-[#9A4242]/40 rounded-xl flex flex-col items-center justify-center gap-0.5 pointer-events-auto cursor-pointer transition-all active:scale-95"
                      >
                        <span className="text-xs">❌</span>
                        <span className="text-[7.5px] font-mono font-bold text-[#E59797] uppercase tracking-wider">Cancel</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 11 HIGHLY SPECIFIC TACTILE QUICK STOPS FOR SAFE DRIVING */}
                <div className="w-full max-w-sm mx-auto space-y-1.5 pt-2">
                  <span className="text-[7.5px] font-mono text-stone-400 uppercase tracking-widest font-black block text-center">
                    🚙 Tactile Quick Stop Presets
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "Coffee", icon: Coffee, category: "Coffee" },
                      { label: "Gas", icon: Fuel, category: "Gas" },
                      { label: "Thrift Store", icon: ShoppingBag, category: "Thrift Store" },
                      { label: "Grocery", icon: ShoppingCart, category: "Grocery" },
                      { label: "Food", icon: Utensils, category: "Food" },
                      { label: "Hiking", icon: Trees, category: "Hiking" },
                      { label: "Pharmacy", icon: Pill, category: "Pharmacy" },
                      { label: "Trail / Walking Trail", icon: Footprints, category: "Trail / Walking Trail" },
                      { label: "Rest Stop", icon: ParkingCircle, category: "Rest Stop" },
                      { label: "Hospital", icon: HospitalIcon, category: "Hospital" },
                      { label: "Beach", icon: Palmtree, category: "Beach" },
                    ].map(preset => {
                      const PresetIcon = preset.icon;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            handleQuickStopSearch(preset.category);
                          }}
                          className="p-3 bg-[#1A1816]/90 hover:bg-[#25211E] border border-stone-850/60 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all focus:outline-none shadow-sm shadow-black/45 hover:border-[#7C5C39]/40 group"
                        >
                          <div className="text-stone-400 group-hover:text-amber-500 transition-colors">
                            <PresetIcon className="w-5 h-5 pointer-events-none" />
                          </div>
                          <span className="text-[8.5px] font-mono font-black tracking-tight text-[#BFBFA1] leading-none text-center truncate w-full">{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SCROLLING ASSISTANT EVENT LOG & REAL-TIME EVENT DISPATCH CONSOLE */}
                <div className="w-full max-w-sm mx-auto p-3 bg-stone-950/80 border border-stone-900 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between border-b border-stone-900 pb-1">
                    <span className="text-[7px] font-mono text-stone-500 uppercase tracking-widest font-black">
                      📡 Real-Time Assistant Console
                    </span>
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5CA359] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#4C8849]"></span>
                    </span>
                  </div>
                  <div className="h-[75px] overflow-y-auto space-y-1 pr-1 font-mono text-[7.5px] leading-relaxed scrollbar-thin scrollbar-thumb-stone-900 flex flex-col justify-start">
                    {assistantEvents.length === 0 ? (
                      <div className="text-stone-600 italic text-center py-4">
                        Waiting for voice assistant state transitions...
                      </div>
                    ) : (
                      assistantEvents.map((evt, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-2 border-b border-stone-900/45 pb-0.5">
                          <span className="text-[#A5C599] font-black tracking-tight uppercase">
                            ⚙️ {evt.name}
                          </span>
                          <span className="text-stone-500 shrink-0">
                            {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* BOTTOM VOICE/DRIVE CONTROL BUTTONS */}
              <div className="space-y-4 max-w-sm mx-auto w-full pt-4 border-t border-stone-900">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={toggleMuteOption}
                    className={`py-4 rounded-2xl border font-mono text-[10px] font-black uppercase text-center cursor-pointer transition-all active:scale-95 shadow-md ${
                      profile.settings.responseMode === 'text' 
                        ? 'bg-rose-950/60 border-rose-900 text-rose-300' 
                        : 'bg-[#1E1C1A] border-stone-800 text-stone-300 hover:bg-[#2C2C20]'
                    }`}
                  >
                    {profile.settings.responseMode === 'text' ? '📢 Speak Answers' : '🔇 Mute Roamie Voice'}
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      isDrivingListeningActiveRef.current = false;
                      setRoamieState('idle');
                      roamieStateRef.current = 'idle';
                      if (recognitionRef.current) {
                        try {
                          recognitionRef.current.stop();
                        } catch (e) {}
                      }
                      setActiveScreen('home');
                    }}
                    className="py-4 bg-red-950/60 hover:bg-red-900/70 border border-red-900 text-red-100 rounded-2xl font-mono text-[10px] font-black uppercase text-center cursor-pointer transition-all active:scale-95 shadow-lg"
                  >
                    🛑 Exit Roaming Mode
                  </button>
                </div>

                <p className="text-[8px] font-mono text-stone-400 text-center leading-normal">
                  Toggle manually on Roamie's portrait or say <strong className="text-stone-300">"Thank you, Roamie"</strong> to return her to standby sleep.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ---- SCREEN 5: SETTINGS SCREEN ---- */}
        {activeScreen === 'settings' && (
          <div className="p-4 space-y-4 animate-fade-in text-xs font-mono">
            <div className="flex items-center justify-between border-b border-[#2C2A26] pb-2">
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 cursor-pointer text-stone-400 hover:text-white" onClick={() => setActiveScreen('home')} />
                <h3 className="font-serif text-xs font-bold text-[#fcfbfa]">System Configuration Preferences</h3>
              </div>
            </div>

            {/* ACCOUNT INFO CARD */}
            <div className="p-4 bg-[#1E1C1A] border border-[#2C2A26] rounded-2xl space-y-2.5">
              <span className="text-[9px] text-[#7C7C59] font-black uppercase tracking-wider block">1. Shared Account Info</span>
              
              <div className="font-mono text-[10px] space-y-1 text-stone-300">
                <p><span className="text-stone-500">Core Users:</span> Susan & Rhonda</p>
                <p><span className="text-stone-500">Coordinate Email:</span> rgallant@hr.com</p>
                <p><span className="text-stone-500 font-serif">Home Base Area:</span> 124 Lornada Drive, Onslow Mountain, NS</p>
                <p><span className="text-stone-500">TimeZone Clock:</span> Atlantic Time (GMT-3)</p>
              </div>

              {/* Locked Asset status review (no editing allows, fully hidden after setup) */}
              <div className="pt-2 border-t border-stone-800 grid grid-cols-2 gap-2 text-[9px]">
                <div className="flex items-center gap-1 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Core Logo Locked
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Character Portrait Secured
                </div>
              </div>

              {isApiKeyExpiredAlert && (
                <div className="pt-2.5 border-t border-stone-800 space-y-1 text-left">
                  <div className="flex items-center gap-1 text-amber-500 font-bold uppercase text-[8.5px]">
                    ⚠️ GEMINI_API_KEY EXPIRED / INVALID
                  </div>
                  <p className="text-[8px] text-stone-400 leading-normal font-sans">
                    Your Gemini API key has expired. Please update the <code className="bg-stone-900 border border-stone-850 px-1 py-0.5 rounded text-amber-400">GEMINI_API_KEY</code> parameter in the AI Studio Settings menu to restore the high-performance online conversational AI stream.
                  </p>
                </div>
              )}
            </div>

            {/* APP IDENTITY BRANDING CARD */}
            <div className="p-4 bg-[#1E1C1A] border border-[#2C2A26] rounded-2xl space-y-3.5">
              <span className="text-[9px] text-[#7C7C59] font-black uppercase tracking-wider block">1b. Living App Identity Branding</span>
              
              <div className="grid grid-cols-2 gap-3.5 bg-[#141312] border border-stone-850 p-3 rounded-xl">
                {/* Logo section */}
                <div className="flex flex-col items-center justify-center text-center space-y-1.5 p-2 bg-stone-900/20 rounded-lg">
                  <span className="text-[8px] text-stone-500 font-mono uppercase font-bold tracking-wider">Product Logo</span>
                  <div 
                    onClick={() => logoInputRef.current?.click()}
                    className="w-16 h-12 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-center p-1.5 cursor-pointer hover:border-amber-500 hover:bg-stone-900 transition-all group"
                    title="Click to change corporate branding logo"
                  >
                    {profile.branding.logoUrl ? (
                      <img 
                        src={profile.branding.logoUrl} 
                        alt="Branding Logo" 
                        className="max-h-full max-w-full object-contain rounded"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-stone-600 group-hover:text-amber-500">
                        <Upload className="w-4 h-4" />
                        <span className="text-[7.5px] font-mono mt-0.5">Upload Image</span>
                      </div>
                    )}
                  </div>
                  {profile.branding.logoUrl && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Clear out custom logo and clear IndexedDB
                        saveBrandingAsset('logoUrl', '').then(() => {
                          setProfile(prev => ({
                            ...prev,
                            branding: {
                              ...prev.branding,
                              logoUrl: null,
                              logoLocked: false
                            }
                          }));
                        });
                      }}
                      className="text-[7.5px] font-mono text-red-400 hover:text-red-300 transition-colors uppercase font-bold cursor-pointer"
                    >
                      Clear custom logo
                    </button>
                  )}
                </div>

                {/* Avatar section */}
                <div className="flex flex-col items-center justify-center text-center space-y-1.5 p-2 bg-stone-900/20 rounded-lg">
                  <span className="text-[8px] text-stone-500 font-mono uppercase font-bold tracking-wider">System Avatar</span>
                  <div 
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-12 h-12 rounded-full border border-stone-850 overflow-hidden cursor-pointer hover:border-amber-500 hover:scale-105 transition-all flex items-center justify-center"
                    title="Click to update companion portrait avatar image"
                  >
                    <img src={profile.branding.avatarUrl} alt="Roamie" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[8px] text-stone-400 font-medium font-serif leading-none">Avatar Locked: OK</span>
                </div>
              </div>

              <div className="text-[9.5px] text-stone-400 space-y-1 font-sans pl-1">
                <p className="flex items-center gap-1.5 text-emerald-400 font-mono text-[9px]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> BRAND IDENTITY ENCRYPTED SECURELY
                </p>
                <p className="text-stone-500 text-[8.5px] font-mono leading-tight">
                  Both visual assets are securely mirrored in IndexedDB local caches and survive page requests.
                </p>
              </div>
            </div>

            {/* INTERACTION PREFERENCE MODES */}
            <div className="p-4 bg-[#1E1C1A] border border-[#2C2A26] rounded-2xl space-y-4">
              <h4 className="text-[10px] text-[#7C7C59] font-black uppercase tracking-wider">2. Dialogue Delivery Output</h4>

              <div className="space-y-2 text-[10px] font-serif text-stone-300">
                <label className="block text-stone-400">Choose preferred mode of interaction:</label>
                
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#141312] rounded-xl border border-stone-800">
                  <button 
                    onClick={() => setProfile(prev => ({ ...prev, settings: { ...prev.settings, responseMode: 'text' } }))}
                    className={`py-2 text-center rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all ${
                      profile.settings.responseMode === 'text' 
                        ? 'bg-[#3F3F2D] text-white font-bold' 
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    Text Only
                  </button>
                  <button 
                    onClick={() => setProfile(prev => ({ ...prev, settings: { ...prev.settings, responseMode: 'voice' } }))}
                    className={`py-2 text-center rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all ${
                      profile.settings.responseMode === 'voice' 
                        ? 'bg-purple-950 text-purple-200 border border-purple-900 font-bold' 
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                    title="Logs are hidden, listen to text aloud"
                  >
                    Voice Only
                  </button>
                  <button 
                    onClick={() => setProfile(prev => ({ ...prev, settings: { ...prev.settings, responseMode: 'combined' } }))}
                    className={`py-2 text-center rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all ${
                      profile.settings.responseMode === 'combined' 
                        ? 'bg-[#7C7C59] text-stone-900 font-black' 
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    Combined
                  </button>
                </div>
              </div>

              {/* Hands-Free Voice Assistant Setting */}
              <div className="space-y-2 text-[10px] border-t border-stone-850/60 pt-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="block text-stone-300 font-bold font-serif uppercase tracking-wider text-[9px]">Hands-Free Voice Assistant</label>
                    <p className="text-[8.5px] text-stone-500 font-sans leading-tight">
                      Allows Roamie to respond to "Hey Roamie" from anywhere in the app.
                    </p>
                  </div>
                  <div className="flex bg-[#141312] border border-stone-800 rounded-lg overflow-hidden shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setProfile(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            handsFreeEnabled: true
                          }
                        }));
                      }}
                      className={`px-3 py-1.5 text-[8px] font-mono uppercase tracking-wide transition-all ${
                        profile.settings.handsFreeEnabled !== false
                          ? 'bg-[#7C7C59] text-stone-900 font-black'
                          : 'text-stone-500 hover:text-stone-300'
                      }`}
                    >
                      Enabled
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfile(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            handsFreeEnabled: false
                          }
                        }));
                        safeStopRecognition();
                      }}
                      className={`px-3 py-1.5 text-[8px] font-mono uppercase tracking-wide transition-all ${
                        profile.settings.handsFreeEnabled === false
                          ? 'bg-rose-950 text-rose-300 font-semibold'
                          : 'text-stone-500 hover:text-stone-300'
                      }`}
                    >
                      Disabled
                    </button>
                  </div>
                </div>

                {/* Smart Interrupt Mode Toggle */}
                <div className="flex items-start justify-between gap-4 pt-2 border-t border-stone-900/40">
                  <div className="space-y-0.5">
                    <label className="block text-stone-300 font-bold font-serif uppercase tracking-wider text-[9px]">Smart Interrupt Mode</label>
                    <p className="text-[8.5px] text-stone-500 font-sans leading-tight">
                      Prioritize real-time user commands over speech output completion.
                    </p>
                  </div>
                  <div className="flex bg-[#141312] border border-stone-800 rounded-lg overflow-hidden shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setProfile(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            smartInterruptEnabled: true
                          }
                        }));
                      }}
                      className={`px-3 py-1.5 text-[8px] font-mono uppercase tracking-wide transition-all ${
                        profile.settings.smartInterruptEnabled !== false
                          ? 'bg-[#7C7C59] text-stone-900 font-black'
                          : 'text-stone-500 hover:text-stone-300'
                      }`}
                    >
                      On
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfile(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            smartInterruptEnabled: false
                          }
                        }));
                      }}
                      className={`px-3 py-1.5 text-[8px] font-mono uppercase tracking-wide transition-all ${
                        profile.settings.smartInterruptEnabled === false
                          ? 'bg-rose-950 text-rose-300 font-semibold'
                          : 'text-stone-500 hover:text-stone-300'
                      }`}
                    >
                      Off
                    </button>
                  </div>
                </div>
              </div>

              {/* VOICE ASSISTANCE MODE */}
              <div className="space-y-2 text-[10px] border-t border-stone-850/60 pt-3">
                <label className="block text-stone-300 font-bold font-serif uppercase tracking-wider text-[9px]">Voice Assistance Mode</label>
                <p className="text-[8.5px] text-stone-500 font-sans leading-tight">
                  Choose formatting & conversational mode for voice assistance:
                </p>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#141312] rounded-xl border border-stone-800">
                  <button 
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, settings: { ...prev.settings, voiceAssistanceMode: 'drive' } }))}
                    className={`py-2 px-1 text-center rounded-lg font-mono text-[8px] uppercase tracking-wide transition-all flex flex-col items-center justify-center ${
                      profile.settings.voiceAssistanceMode !== 'third_wheel' 
                        ? 'bg-[#7C7C59] text-stone-900 font-black' 
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    <span className="font-bold">🚗 Drive Mode</span>
                    <span className="text-[7px] lowercase tracking-normal text-stone-500 font-sans mt-0.5 block leading-none">Short structured lists, no follow-up</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, settings: { ...prev.settings, voiceAssistanceMode: 'third_wheel' } }))}
                    className={`py-2 px-1 text-center rounded-lg font-mono text-[8px] uppercase tracking-wide transition-all flex flex-col items-center justify-center ${
                      profile.settings.voiceAssistanceMode === 'third_wheel' 
                        ? 'bg-purple-950 text-purple-200 border border-purple-900 font-bold' 
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    <span className="font-bold">🧑‍🤝‍🧑 Third Wheel</span>
                    <span className="text-[7px] lowercase tracking-normal text-[#A78BFA] font-sans mt-0.5 block leading-none">Warm chat, friendly follow-ups</span>
                  </button>
                </div>
              </div>

              {/* Hardware Synthesis voice setup picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-stone-400 block font-serif">Voice Vocal Mode Synthesizer Selector:</label>
                <select 
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  className="w-full bg-[#141312] border border-stone-800 text-stone-300 p-2 rounded-xl text-[10px] font-mono focus:outline-none"
                >
                  {availableVoices.length === 0 ? (
                    <option value="">-- Browser default voice --</option>
                  ) : (
                    availableVoices.filter(v => v.lang.startsWith('en')).map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
                    ))
                  )}
                </select>
                <div className="flex items-center justify-between pt-1">
                  <button 
                    onClick={() => speakText("Vocal test complete.")}
                    className="py-1 px-3 bg-[#2C2A26] border border-stone-800 hover:bg-neutral-800 text-[10px] text-stone-300 rounded font-mono cursor-pointer"
                  >
                    📢 Test synthesizer
                  </button>
                </div>
              </div>

              {/* MICROPHONE ACTIVATION MODE */}
              <div className="space-y-2 text-[10px] border-t border-stone-850/60 pt-3">
                <label className="block text-stone-300 font-bold font-serif uppercase tracking-wider text-[9px]">Microphone Activation Mode</label>
                <p className="text-[8.5px] text-stone-500 font-sans leading-tight">
                  Choose how the microphone activates for hands-free operations:
                </p>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#141312] rounded-xl border border-stone-800">
                  <button 
                    type="button"
                    onClick={() => {
                      setProfile(prev => ({ 
                        ...prev, 
                        settings: { ...prev.settings, alwaysOnWakeWordEnabled: false } 
                      }));
                      stopPassiveWakeWordListener();
                    }}
                    className={`py-2 px-1 text-center rounded-lg font-mono text-[8px] uppercase tracking-wide transition-all flex flex-col items-center justify-center cursor-pointer ${
                      !profile.settings.alwaysOnWakeWordEnabled
                        ? 'bg-[#7C7C59] text-[#141211] font-black' 
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    <span className="font-bold">🎤 Manual Mode</span>
                    <span className="text-[7px] lowercase tracking-normal text-stone-500 font-sans mt-0.5 block leading-none">Press mic button to speak, mic is off at startup</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setProfile(prev => ({ 
                        ...prev, 
                        settings: { ...prev.settings, alwaysOnWakeWordEnabled: true } 
                      }));
                      // Wait a beat for state to update, then schedule start
                      setTimeout(() => {
                        startPassiveWakeWordListener();
                      }, 100);
                    }}
                    className={`py-2 px-1 text-center rounded-lg font-mono text-[8px] uppercase tracking-wide transition-all flex flex-col items-center justify-center cursor-pointer ${
                      profile.settings.alwaysOnWakeWordEnabled
                        ? 'bg-rose-950 text-rose-200 border border-rose-900 font-bold' 
                        : 'text-stone-500 hover:text-stone-350'
                    }`}
                  >
                    <span className="font-bold">🗣️ Wake Word Mode</span>
                    <span className="text-[7px] lowercase tracking-normal text-stone-400 font-sans mt-0.5 block leading-none">Say "Hey Romy" to activate voice anytime</span>
                  </button>
                </div>
              </div>

              {/* DEVELOPER DEBUG MODE */}
              <div className="flex items-center justify-between border-t border-stone-850/60 pt-3 text-[10px]">
                <div className="pr-4">
                  <label className="block text-stone-300 font-bold font-serif uppercase tracking-wider text-[9px]">Developer Debug Diagnostics</label>
                  <p className="text-[8.5px] text-stone-500 font-sans leading-tight mt-0.5">
                    Show real-time speech transcripts, intents, and vocal states:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfile(prev => ({ 
                    ...prev, 
                    settings: { ...prev.settings, developerDebugMode: !prev.settings.developerDebugMode } 
                  }))}
                  className={`px-3 py-1.5 text-[8.5px] font-mono uppercase tracking-wide transition-all rounded shrink-0 cursor-pointer ${
                    profile.settings.developerDebugMode
                      ? 'bg-rose-950 text-rose-300 font-black border border-rose-900/60'
                      : 'bg-[#141312] text-stone-500 hover:text-stone-350 border border-stone-800'
                  }`}
                >
                  {profile.settings.developerDebugMode ? 'On' : 'Off'}
                </button>
              </div>
            </div>

            {/* TRAVELER IDENTITY & SYSTEM COLOR SPACE (Requirement 1, 2, 7, 8, 9, 10) */}
            <div className="p-4 bg-[#1E1C1A] border border-[#2C2A26] rounded-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#7C7C59] font-black uppercase tracking-wider block">
                  1c. Traveler Personalization Spaces
                </span>
                <span className="text-[7.5px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full uppercase font-bold">
                  Shared Connection Active
                </span>
              </div>

              <div className="space-y-4">
                {travelers.map((t, index) => {
                  const style = getUserColorStyle(t.name);
                  
                  return (
                    <div 
                      key={t.userId} 
                      className="p-3.5 bg-[#141312] rounded-xl border space-y-3 transition-colors duration-300"
                      style={{ borderColor: style.hex + '3a' }}
                    >
                      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: style.hex + '1a' }}>
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow font-sans"
                            style={{ backgroundColor: style.hex }}
                          >
                            {t.displayName.toUpperCase().slice(0, 1)}
                          </span>
                          <div>
                            <h4 className="font-serif font-black text-[12px] leading-none" style={{ color: style.hex }}>
                              {t.name} Config Panel
                            </h4>
                            <span className="text-[7.5px] font-mono text-stone-500 uppercase">
                              Primary ID: {t.userId}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: style.hex }} />
                          <span className="text-[7.5px] font-mono text-stone-400">
                            Synced Offline
                          </span>
                        </div>
                      </div>

                      {/* Editing fields */}
                      <div className="grid grid-cols-2 gap-3.5">
                        {/* Nickname / Display Name input */}
                        <div className="space-y-1">
                          <label className="text-[8px] text-stone-500 uppercase font-black block">NickName / Display Name:</label>
                          <input 
                            type="text"
                            value={t.displayName}
                            onChange={(e) => {
                              const newTravelers = [...travelers];
                              newTravelers[index].displayName = e.target.value || t.name;
                              setTravelers(newTravelers);
                            }}
                            className="w-full bg-[#1A1816] border border-stone-850 p-2 rounded-lg text-[10px] text-stone-200 focus:outline-none focus:border-stone-500 transition font-serif leading-none"
                            placeholder={t.name}
                          />
                        </div>

                        {/* Crew Role */}
                        <div className="space-y-1">
                          <label className="text-[8px] text-stone-500 uppercase font-black block">Partnership Role:</label>
                          <input 
                            type="text"
                            value={t.role}
                            onChange={(e) => {
                              const newTravelers = [...travelers];
                              newTravelers[index].role = e.target.value || 'partner';
                              setTravelers(newTravelers);
                            }}
                            className="w-full bg-[#1A1816] border border-stone-850 p-2 rounded-lg text-[10px] text-stone-200 focus:outline-none focus:border-stone-500 transition font-mono leading-none"
                            placeholder="partner"
                          />
                        </div>
                      </div>

                      {/* Bubble styling & preset selector */}
                      <div className="grid grid-cols-2 gap-3.5">
                        {/* Bubble Style selector */}
                        <div className="space-y-1">
                          <label className="text-[8px] text-stone-500 uppercase font-black block">Bubble Bubble Style:</label>
                          <select 
                            value={t.bubbleStyle || 'solid'}
                            onChange={(e) => {
                              const newTravelers = [...travelers];
                              newTravelers[index].bubbleStyle = e.target.value as any;
                              setTravelers(newTravelers);
                            }}
                            className="w-full bg-[#1A1816] border border-stone-850 p-2 rounded-lg text-[10px] text-stone-350 focus:outline-none focus:border-stone-500 leading-none cursor-pointer"
                          >
                            <option value="solid">Full Solid Accent</option>
                            <option value="bordered">Outlined Contrast</option>
                            <option value="playful">Playful Rounded</option>
                          </select>
                        </div>

                        {/* Preferred Theme Accent color selector */}
                        <div className="space-y-1">
                          <label className="text-[8px] text-stone-500 uppercase font-black block">Theme Color Palette:</label>
                          <div className="flex items-center gap-1.5 bg-[#1A1816] border border-stone-850 p-1 rounded-lg">
                            <input 
                              type="color"
                              value={t.accentColor}
                              onChange={(e) => {
                                const newTravelers = [...travelers];
                                newTravelers[index].accentColor = e.target.value;
                                setTravelers(newTravelers);
                              }}
                              className="w-6 h-6 rounded bg-transparent cursor-pointer border-0 p-0"
                            />
                            <input 
                              type="text"
                              value={t.accentColor}
                              onChange={(e) => {
                                const newTravelers = [...travelers];
                                newTravelers[index].accentColor = e.target.value;
                                setTravelers(newTravelers);
                              }}
                              className="w-full bg-transparent text-[9.5px] text-stone-300 font-mono leading-none focus:outline-none pr-1"
                              maxLength={7}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Quick Preset Colors helpers */}
                      <div className="space-y-1">
                        <label className="text-[7.5px] text-stone-500 uppercase block font-semibold">Quick Hue Presets:</label>
                        <div className="flex gap-2">
                          {t.name === 'Rhonda' ? (
                            <>
                              {['#10b981', '#059669', '#15803d', '#047857'].map((col) => (
                                <button
                                  key={col}
                                  type="button"
                                  onClick={() => {
                                    const newTravelers = [...travelers];
                                    newTravelers[index].accentColor = col;
                                    setTravelers(newTravelers);
                                  }}
                                  className={`w-4 h-4 rounded-full border border-white/10 cursor-pointer hover:scale-110 active:scale-95 transition-all ${
                                    t.accentColor === col ? 'ring-2 ring-white ring-offset-1 ring-offset-[#141312]' : ''
                                  }`}
                                  style={{ backgroundColor: col }}
                                />
                              ))}
                            </>
                          ) : (
                            <>
                              {['#8b5cf6', '#7c3aed', '#a855f7', '#6d28d9'].map((col) => (
                                <button
                                  key={col}
                                  type="button"
                                  onClick={() => {
                                    const newTravelers = [...travelers];
                                    newTravelers[index].accentColor = col;
                                    setTravelers(newTravelers);
                                  }}
                                  className={`w-4 h-4 rounded-full border border-white/10 cursor-pointer hover:scale-110 active:scale-95 transition-all ${
                                    t.accentColor === col ? 'ring-2 ring-white ring-offset-1 ring-offset-[#141312]' : ''
                                  }`}
                                  style={{ backgroundColor: col }}
                                />
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MUSIC PROVIDER INTEGRATION SETTINGS */}
            <div className="p-4 bg-[#1E1C1A] border border-[#2C2A26] rounded-2xl space-y-4">
              <h4 className="text-[10px] text-[#7C7C59] font-black uppercase tracking-wider block">3. Admin Panel: Music Integrations & Configuration</h4>
              
              <div className="space-y-4 text-[10px] font-serif text-stone-300">
                {/* Active Platform Selector */}
                <div className="space-y-1">
                  <label className="text-stone-400 block pb-1">Select Active Safe Driving Media Provider:</label>
                  <select 
                    value={musicProvider}
                    onChange={(e) => {
                      setMusicProvider(e.target.value);
                      setIsMusicPlaying(false);
                    }}
                    className="w-full bg-[#141312] border border-stone-800 text-stone-200 p-2 rounded-xl text-[10px] font-mono focus:outline-none"
                  >
                    {musicProviders
                      .filter(p => p.status === 'enabled')
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.logo} {p.name}
                        </option>
                      ))}
                    {musicProviders.filter(p => p.status === 'enabled').length === 0 && (
                      <option value="">No providers enabled (Disabled/Muted Mode)</option>
                    )}
                  </select>
                  <p className="text-[8px] font-mono text-stone-500 pt-1">
                    Only providers marked as "Enabled" below can be selected as primary driving sound channels.
                  </p>
                </div>

                {/* Administration Grid */}
                <div className="space-y-2 pt-2 border-t border-stone-800/80">
                  <span className="text-[8px] font-mono text-[#7C7C59] uppercase tracking-wider block font-bold">Manage Provider Registries & Order:</span>
                  
                  <div className="space-y-2.5">
                    {musicProviders
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((prov, idx) => {
                        const isSelectedDefault = defaultMusicProviderId === prov.id;
                        
                        return (
                          <div 
                            key={prov.id} 
                            style={{ contentVisibility: 'auto' }}
                            className="bg-[#141312] border border-stone-800 p-2.5 rounded-xl space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2.5">
                              {/* Logo, Name and Default tag */}
                              <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-stone-200">
                                <span>{prov.logo}</span>
                                <span>{prov.name}</span>
                                {isSelectedDefault && (
                                  <span className="text-[7.5px] bg-[#7C7C59] text-stone-900 px-1 py-0.2 rounded font-black uppercase">Default</span>
                                )}
                              </div>

                              {/* Ordering Actions */}
                              <div className="flex items-center gap-1 font-mono">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    const newProv = [...musicProviders];
                                    // swap order fields
                                    const temp = newProv[idx].order;
                                    newProv[idx].order = newProv[idx - 1].order;
                                    newProv[idx - 1].order = temp;
                                    setMusicProviders(newProv);
                                  }}
                                  className="p-1 px-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-30 rounded text-stone-300 font-bold transition cursor-pointer"
                                  title="Move Up"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === musicProviders.length - 1}
                                  onClick={() => {
                                    const newProv = [...musicProviders];
                                    // swap order fields
                                    const temp = newProv[idx].order;
                                    newProv[idx].order = newProv[idx + 1].order;
                                    newProv[idx + 1].order = temp;
                                    setMusicProviders(newProv);
                                  }}
                                  className="p-1 px-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-30 rounded text-stone-300 font-bold transition cursor-pointer"
                                  title="Move Down"
                                >
                                  ▼
                                </button>
                              </div>
                            </div>

                            {/* Configuration Selects / Controls */}
                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-900/60 font-mono text-[8.5px]">
                              {/* Status Select */}
                              <div className="space-y-0.5">
                                <span className="text-stone-500 block text-[7.5px] uppercase font-bold">Integration Status:</span>
                                <select
                                  value={prov.status}
                                  onChange={(e) => {
                                    const val = e.target.value as any;
                                    setMusicProviders(prev => prev.map(p => {
                                      if (p.id === prov.id) return { ...p, status: val };
                                      return p;
                                    }));
                                    if (val !== 'enabled' && musicProvider === prov.id) {
                                      // fallback active selection
                                      setMusicProvider(defaultMusicProviderId === prov.id ? 'amazon' : defaultMusicProviderId);
                                    }
                                  }}
                                  className="bg-stone-900 border border-stone-850 p-1 rounded font-sans text-[8.5px] text-stone-300 w-full focus:outline-none"
                                >
                                  <option value="enabled">🟢 Enabled</option>
                                  <option value="hidden">🟡 Hidden</option>
                                  <option value="disabled">🔴 Disabled</option>
                                </select>
                              </div>

                              {/* Mark Default Trigger */}
                              <div className="space-y-0.5 flex flex-col justify-end">
                                <button
                                  type="button"
                                  disabled={isSelectedDefault || prov.status === 'disabled'}
                                  onClick={() => {
                                    setDefaultMusicProviderId(prov.id);
                                  }}
                                  className="w-full py-1 text-center bg-stone-900 border border-stone-850 hover:bg-stone-850 text-stone-300 rounded font-sans uppercase text-[7px] tracking-wider transition disabled:opacity-40 select-none cursor-pointer font-bold"
                                >
                                  Set As Default
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            {/* VEHICLE BLUETOOTH ONBOARD LINK STATUS */}
            <div className="p-4 bg-[#1E1C1A] border border-[#2C2A26] rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-[#7C7C59] font-black uppercase tracking-wider block">3b. Vehicle Bluetooth Link Settings</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Bluetooth className={`w-3.5 h-3.5 ${isBluetoothConnected ? 'text-indigo-400' : 'text-stone-600'}`} />
                  <span className={`text-[8px] font-mono uppercase font-black px-1.5 py-0.5 rounded ${
                    isBluetoothConnected ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/40 animate-pulse' : 'bg-amber-950 text-amber-500 border border-amber-900/30'
                  }`}>
                    {isBluetoothConnected ? "LINKED ONBOARD" : "NOT CONNECTED"}
                  </span>
                </div>
              </div>

              <p className="font-serif text-stone-300 leading-relaxed text-[10px]">
                Connect your mobile device to the vehicle sound system wirelessly. This routes Roamie's voice guidance, navigation calls, and safe-driving music through the car speakers.
              </p>

              <div className="p-3 bg-[#141312] border border-stone-850 rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-stone-900 pb-2 flex-wrap">
                  <span className="text-stone-400 text-[8.5px] font-mono">Audio Stream Output:</span>
                  <div className="flex items-center gap-1.5 header-btn-group">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsBluetoothModalOpen(true);
                        startBluetoothScan();
                      }}
                      className="px-3 py-1 font-mono text-[8px] uppercase font-bold rounded bg-indigo-900 hover:bg-indigo-800 text-indigo-100 transition-all cursor-pointer"
                    >
                      {isBluetoothConnected ? "Pair New Device" : "Connect Bluetooth"}
                    </button>
                    {isBluetoothConnected && (
                      <button 
                        type="button"
                        onClick={handleDisconnectBluetooth}
                        className="px-3 py-1 font-mono text-[8px] uppercase font-bold rounded bg-red-950 hover:bg-red-900 text-red-250 border border-red-900/40 transition-all cursor-pointer"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>

                <div className="font-mono text-[8px] text-stone-500 space-y-1.5">
                  <p>• Device Node: <span className="text-stone-300">{selectedBluetoothDeviceName}</span></p>
                  <p>• Status: <span className={isBluetoothConnected ? "text-indigo-400 font-bold animate-pulse" : "text-amber-500 font-medium"}>
                    {isBluetoothConnected ? "A2DP Stereo Stream Active (Perfect Line)" : "Muted (Using Handset Phone Speaker)"}
                  </span></p>
                </div>

                <div className="pt-2 border-t border-stone-900 space-y-1.5">
                  <span className="text-[7.5px] font-mono text-[#7C7C59] uppercase block font-black">Android Integration (Native Auto)</span>
                  <p className="text-[8px] text-stone-400 font-serif leading-snug">
                    Running inside Android Auto or tablet browser? You can trigger the native Android available devices menu to pair other speaker boxes.
                  </p>
                  <button
                    type="button"
                    onClick={handleLaunchAndroidBluetoothSettings}
                    className="w-full py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white font-mono text-[7.5px] uppercase font-bold rounded border border-stone-800 transition-all cursor-pointer text-center"
                  >
                    Launch Android System Picker
                  </button>
                </div>
              </div>
            </div>

            {/* WIPE HISTORY SYSTEM CAP */}
            <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-2xl space-y-2 text-[10px]">
              <span className="text-[9px] text-[#7C7C59] font-black uppercase tracking-wider block text-red-400">3. Danger Corridor Control</span>
              
              <p className="font-serif text-stone-400 pr-2">
                Erase Susan and Rhonda's complete conversation history data. This action is irreversible.
              </p>

              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to permanently clear Susan & Rhonda's complete logs?")) {
                    updateChatMessages('trip-ottawa', [
                      {
                        id: generateId(),
                        role: 'avatar',
                        type: 'text',
                        content: 'Pristine state restored. Ready to build slow escape memories.',
                        timestamp: Date.now(),
                        senderName: 'Roamie'
                      }
                    ]);
                    alert("Complete logs deleted.");
                  }
                }}
                className="w-full py-2 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 rounded-xl font-mono text-[9px] uppercase font-bold"
              >
                🧹 Erase Logs
              </button>
            </div>

            {/* PWA INSTALLATION MANAGEMENT CARD */}
            <div className="p-4 bg-[#1E1C1A] border border-[#2C2A26] rounded-2xl space-y-3.5 text-[10px]">
              <span className="text-[9px] text-[#7C7C59] font-black uppercase tracking-wider block">4. Progressive Web App (PWA) Setup</span>
              
              <p className="font-serif text-stone-300 leading-relaxed">
                Run Roamie in elegant full-screen standalone mode directly from your mobile home screen with zero browser UI, quick launch caching, and optimized offline access.
              </p>

              {isAppInstalled ? (
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/60 rounded-xl flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[9.5px] text-emerald-400 font-bold uppercase tracking-wider">Installed & Standalone Ready</span>
                </div>
              ) : deferredPrompt ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 font-bold" />
                    <span className="font-mono text-[8.5px] uppercase">Installable App Detected</span>
                  </div>
                  <button 
                    onClick={handleInstallApp}
                    className="w-full py-2.5 bg-[#7C7C59] hover:bg-[#68684a] text-stone-900 rounded-xl font-mono text-[9.5px] uppercase font-black tracking-wider transition active:scale-95 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    ✨ Add to Home Screen (Install)
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-[#141312] border border-stone-800 rounded-xl space-y-2 text-[9px] font-mono text-stone-400">
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <span className="text-stone-500">🛡️</span>
                    <span>Standard iOS / Mobile Browser Setup:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-stone-500 leading-relaxed text-[8.5px]">
                    <li>Tap the circular <span className="text-stone-300">Share button</span> (or browser menu symbol).</li>
                    <li>Scroll down and select <span className="text-stone-300 font-bold">"Add to Home Screen"</span>.</li>
                    <li>Launch Roamie for instant hands-free Drive Modes from your workspace launcher!</li>
                  </ol>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* FOOTER BAR REMINDER */}
      <footer className="w-full text-center text-[10px] font-mono text-[#7C7C59] py-3.5 bg-[#141312] border-t border-[#2C2A26] fixed bottom-0 z-20">
        <span>Roamie Travel Concierge • 124 Lornada Drive, Onslow Mountain • Private & Secured Workspace Platform</span>
      </footer>

      {/* NAVIGATION SELECTION SYSTEM SELECTOR OVERLAY */}
      {navigationTriggerSource && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1E1C1A] max-w-sm w-full rounded-2xl p-6 border border-stone-850 shadow-2xl text-xs space-y-4 text-stone-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="font-serif text-sm font-bold text-[#fcfbfa] flex items-center gap-1.5 uppercase tracking-wide">
                <Navigation className="w-4 h-4 text-[#7C7C59] animate-pulse" />
                <span>Choose Navigation Route</span>
              </h3>
              <X className="w-5 h-5 text-stone-400 hover:text-white cursor-pointer" onClick={() => setNavigationTriggerSource(null)} />
            </div>

            <div className="space-y-1.5">
              <span className="text-[7.5px] font-mono text-stone-500 uppercase tracking-widest font-black block">Active Navigation Target:</span>
              <div className="p-3 bg-neutral-900 border border-stone-800/80 rounded-xl">
                <p className="font-serif italic text-stone-100 text-xs">"{navigationTriggerSource.label}"</p>
                <div className="mt-2 flex items-center gap-1.5 text-[8.5px] font-mono text-[#7C7C59] uppercase tracking-normal">
                  <MapPin className="w-3 h-3 text-[#7C7C59]" />
                  <span>Nova Scotia (Current Spot) → Route Start</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[7.5px] font-mono text-stone-500 uppercase tracking-widest font-black block">External Navigation Dispatch:</span>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => handleChooseNavigation('google')}
                  className="p-3 bg-[#141312] hover:bg-neutral-900 border border-stone-800 rounded-xl cursor-pointer flex flex-col items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span className="text-xl">🌐</span>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-stone-300">Google Map</span>
                </button>
                <button 
                  onClick={() => handleChooseNavigation('apple')}
                  className="p-3 bg-[#141312] hover:bg-neutral-900 border border-stone-800 rounded-xl cursor-pointer flex flex-col items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span className="text-xl">🍎</span>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-stone-300">Apple Map</span>
                </button>
                <button 
                  onClick={() => handleChooseNavigation('waze')}
                  className="p-3 bg-[#141312] hover:bg-neutral-900 border border-stone-800 rounded-xl cursor-pointer flex flex-col items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span className="text-xl">🚙</span>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-stone-300">Waze App</span>
                </button>
              </div>

              <div className="border-t border-stone-850 my-2 pt-2" />

              <span className="text-[7.5px] font-mono text-stone-500 uppercase tracking-widest font-black block">In-App Co-Pilot HUD:</span>
              <button 
                onClick={() => handleChooseNavigation('in-app')}
                className="w-full p-3 bg-gradient-to-r from-emerald-950/40 to-emerald-950/20 hover:from-emerald-950/60 hover:to-emerald-950/40 border border-emerald-900 text-emerald-350 rounded-xl cursor-pointer flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="text-[10px] font-mono font-black uppercase tracking-wider">Start Roamie GPS HUD Route</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW TRIP OVERLAY MODAL */}
      {showCreateTripModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1E1C1A] max-w-sm w-full rounded-2xl p-5 border border-stone-800 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="font-serif text-sm font-bold text-[#fcfbfa] flex items-center gap-1">
                <Plus className="w-4 h-4 text-[#7C7C59]" />
                <span>Create New Travel Blueprint</span>
              </h3>
              <X className="w-5 h-5 text-stone-400 hover:text-white cursor-pointer" onClick={() => setShowCreateTripModal(false)} />
            </div>

            <form onSubmit={handleCreateNewTripSubmit} className="space-y-3 font-mono">
              <div className="space-y-1">
                <label className="text-[10px] text-stone-200 uppercase font-bold tracking-wider">Destination:</label>
                <input 
                  type="text" 
                  value={newTripData.destination}
                  onChange={(e) => setNewTripData(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="e.g. Cape Breton, NS"
                  className="w-full p-2.5 bg-neutral-900 rounded-xl border border-stone-700 text-stone-100 placeholder-stone-500 text-xs focus:ring-1 focus:ring-[#7C7C59] focus:outline-none"
                  required
                />
              </div>

               <div className="space-y-1">
                <label className="text-[10px] text-stone-200 uppercase font-bold tracking-wider">Trip Title Descriptor:</label>
                <input 
                  type="text" 
                  value={newTripData.title}
                  onChange={(e) => setNewTripData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Quiet Cabot Trail Solitude"
                  className="w-full p-2.5 bg-neutral-900 rounded-xl border border-stone-700 text-stone-100 placeholder-stone-500 text-xs focus:ring-1 focus:ring-[#7C7C59] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-200 uppercase font-bold tracking-wider">Starts Date:</label>
                  <input 
                    type="date" 
                    value={newTripData.startDate}
                    onChange={(e) => setNewTripData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full p-2.5 bg-neutral-900 rounded-xl border border-stone-700 text-stone-100 text-xs focus:ring-1 focus:ring-[#7C7C59] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-200 uppercase font-bold tracking-wider">Ends Date:</label>
                  <input 
                    type="date" 
                    value={newTripData.endDate}
                    onChange={(e) => setNewTripData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full p-2.5 bg-neutral-900 rounded-xl border border-stone-700 text-stone-100 text-xs focus:ring-1 focus:ring-[#7C7C59] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 uppercase">Draft Travel notes:</label>
                <textarea 
                  value={newTripData.notes}
                  onChange={(e) => setNewTripData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Focus on coastal viewpoints, gluten-free seafood, minimal stairs..."
                  className="w-full p-2.5 bg-neutral-900 rounded-xl border border-stone-800 text-xs focus:outline-none h-16 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 mt-2 bg-[#7C7C59] hover:bg-[#5A5A40] text-stone-900 rounded-xl font-mono text-[10px] uppercase font-black tracking-widest shadow-lg"
              >
                Assemble Blueprint Corridor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOM ITINERARY ACTIVITY OVERLAY MODAL */}
      {showAddActivityModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1E1C1A] max-w-sm w-full rounded-2xl p-5 border border-stone-800 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="font-serif text-sm font-bold text-[#fcfbfa] flex items-center gap-1">
                <Plus className="w-4 h-4 text-[#7C7C59]" />
                <span>Add day {selectedDayNum} schedule block</span>
              </h3>
              <X className="w-5 h-5 text-stone-400 hover:text-white cursor-pointer" onClick={() => setShowAddActivityModal(false)} />
            </div>

            <form onSubmit={handleAddCustomActivity} className="space-y-3 font-mono">
              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 uppercase">Time Block Partition:</label>
                <select 
                  value={newActivity.time}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value as any }))}
                  className="w-full p-2.5 bg-neutral-900 rounded-xl border border-stone-800 text-xs focus:outline-none font-mono"
                >
                  <option value="morning">🌅 Morning</option>
                  <option value="afternoon">☀️ Afternoon</option>
                  <option value="evening">🌙 Evening</option>
                  <option value="custom">⚙️ Custom Block</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 uppercase">Activity Title:</label>
                <input 
                  type="text" 
                  value={newActivity.title}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Sweet Tea at Garden Patio"
                  className="w-full p-2.5 bg-neutral-900 rounded-xl border border-stone-800 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 uppercase">Service Description:</label>
                <textarea 
                  value={newActivity.description}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Quiet path near Wellington West. Susan knee can rest comfortably."
                  className="w-full p-2.5 bg-neutral-900 rounded-xl border border-stone-800 text-xs focus:outline-none h-20 resize-none font-serif"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 mt-2 bg-[#7C7C59] hover:bg-[#5A5A40] text-stone-900 rounded-xl font-mono text-[10px] uppercase font-black"
              >
                Secure block to schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TRIP OVERLAY MODAL */}
      {editingTrip && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-stone-200">
          <div className="bg-[#1E1C1A] max-w-sm w-full rounded-2xl p-5 border border-stone-800 shadow-2xl text-xs space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-stone-850 pb-2">
              <h3 className="font-serif text-sm font-black text-[#FAF9F5] flex items-center gap-1.5 uppercase tracking-wide">
                <Edit className="w-4 h-4 text-[#7C7C59]" />
                <span>Edit Trip Blueprint</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingTrip(null)}
                className="p-1 hover:bg-stone-850 rounded text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTripEditSubmit} className="space-y-3 font-mono">
              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 uppercase tracking-wider block font-black">Destination:</label>
                <input 
                  type="text" 
                  value={editingTrip.destination}
                  onChange={(e) => setEditingTrip(prev => prev ? { ...prev, destination: e.target.value } : null)}
                  className="w-full p-2.5 bg-neutral-950 rounded-xl border border-stone-800 text-xs focus:outline-none text-stone-200 focus:border-[#7C7C59]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 uppercase tracking-wider block font-black">Trip Title descriptor:</label>
                <input 
                  type="text" 
                  value={editingTrip.title}
                  onChange={(e) => setEditingTrip(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full p-2.5 bg-neutral-950 rounded-xl border border-stone-800 text-xs focus:outline-none text-stone-200 focus:border-[#7C7C59]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 uppercase tracking-wider block font-black">Start Date:</label>
                  <input 
                    type="text" 
                    value={editingTrip.startDate}
                    onChange={(e) => setEditingTrip(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                    placeholder="May 28, 2026"
                    className="w-full p-2.5 bg-neutral-950 rounded-xl border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#7C7C59]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-400 uppercase tracking-wider block font-black">End Date:</label>
                  <input 
                    type="text" 
                    value={editingTrip.endDate}
                    onChange={(e) => setEditingTrip(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                    placeholder="Jun 1, 2026"
                    className="w-full p-2.5 bg-neutral-950 rounded-xl border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#7C7C59]"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 mt-2 bg-[#7C7C59] hover:bg-[#5A5A40] text-[#1E1C1A] rounded-xl font-mono text-[10px] uppercase font-black tracking-widest shadow-lg cursor-pointer"
              >
                Save travel changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {tripToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1E1C1A] max-w-sm w-full rounded-2xl p-6 border border-stone-800 shadow-2xl space-y-4 text-stone-300">
            <div className="text-center space-y-2">
              <div className="w-11 h-11 rounded-full bg-red-950 text-red-400 flex items-center justify-center mx-auto border border-red-900/60 font-mono">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-sm font-bold text-[#FAF9F5] uppercase tracking-wide">Move to Trash?</h3>
              <p className="font-mono text-[10px] leading-relaxed text-stone-400">
                Are you sure Susan and Rhonda want to remove <strong className="text-white">"{tripToDelete.title}"</strong> and place it in the Trash room?
              </p>
            </div>
            <div className="flex gap-2 font-mono">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="flex-1 py-2 bg-[#2C2A26] text-stone-300 hover:bg-stone-850 rounded-xl text-[9px] uppercase font-bold cursor-pointer transition"
              >
                No, cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSoftDeleteTrip(tripToDelete.tripId);
                  setTripToDelete(null);
                }}
                className="flex-1 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl text-[9px] uppercase font-black cursor-pointer transition"
              >
                Yes, trash it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE LIVE CAMERA VIEWPORT & SLOW-TRAVEL MEMORY CAPTURE MODAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-55 animate-fade-in text-[#ECE6DF]">
          <div className="bg-[#1C1A17] max-w-sm w-full rounded-2xl p-5 border border-stone-800 shadow-2xl text-xs space-y-4">
            
            {/* Viewfinder Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="font-serif text-sm font-bold text-[#fcfbfa] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>{capturedPhotoPreview ? "Review Polaroid Draft" : "Polaroid Co-Copilot Viewfinder"}</span>
              </h3>
              <button 
                type="button"
                className="p-1 hover:bg-stone-800 rounded-md text-stone-400 hover:text-white transition cursor-pointer" 
                onClick={stopCamera}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PREVIEW IMAGE OR VIDEO VIEWPORT */}
            <div className="relative aspect-video w-full rounded-xl bg-black border border-stone-800 overflow-hidden flex flex-col items-center justify-center shadow-inner">
              {capturedPhotoPreview ? (
                <img 
                  src={capturedPhotoPreview} 
                  alt="Captured Polaroid Draft" 
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : cameraError ? (
                <div className="p-4 text-center space-y-1">
                  <span className="text-[10px] font-mono text-[#7C7C59] tracking-widest uppercase block font-bold">✨ MEMORY CONTEXT ACTIVE</span>
                  <p className="font-serif italic text-[11px] text-stone-400">
                    Real-time video stream active. Snap a beautiful polaroid!
                  </p>
                  <p className="text-[9px] font-mono text-stone-500">
                    Contributed by: <strong>{getUserColorStyle(activeUser).displayName}</strong>
                  </p>
                </div>
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              )}

              {/* OVERLAY WATERMARK */}
              <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[7px] font-mono border border-stone-850 tracking-widest text-[#7C7C59] font-bold">
                {capturedPhotoPreview ? "SNAP RECORDED" : "GPS VIEWPORT ACTIVE"}
              </div>
            </div>

            {/* IF COMPLETED CAPTURE, RENDER CAPTIONING AND SORTING FORM */}
            {capturedPhotoPreview ? (
              <div className="space-y-3 font-mono text-[10px] animate-fade-in">
                
                {/* 1. Caption Input */}
                <div className="space-y-1">
                  <label className="text-[8.5px] uppercase font-bold text-stone-400 tracking-wider">✍️ Memory Title & Caption:</label>
                  <input
                    type="text"
                    value={capturedPhotoCaption}
                    onChange={(e) => setCapturedPhotoCaption(e.target.value)}
                    placeholder="E.g., Sunrise over Cape Breton Highlands..."
                    className="w-full bg-neutral-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-600 text-[11px]"
                  />
                </div>

                {/* 2. Destination Trip Choice */}
                <div className="space-y-1">
                  <label className="text-[8.5px] uppercase font-bold text-stone-400 tracking-wider">🎯 Select Associated Trip:</label>
                  <select
                    value={capturedPhotoTripId}
                    onChange={(e) => setCapturedPhotoTripId(e.target.value)}
                    className="w-full bg-neutral-900 border border-stone-800 rounded-lg px-2.5 py-2 text-stone-100 text-[11px] focus:outline-none"
                  >
                    {trips.filter(t => t.status !== 'deleted').map(t => (
                      <option key={t.tripId} value={t.tripId}>
                        {t.title} ({t.destination})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Organizational Album Choice */}
                <div className="space-y-1">
                  <label className="text-[8.5px] uppercase font-bold text-stone-400 tracking-wider">🗂️ Sort into Album:</label>
                  <select
                    value={capturedPhotoAlbumId}
                    onChange={(e) => setCapturedPhotoAlbumId(e.target.value)}
                    className="w-full bg-neutral-900 border border-stone-800 rounded-lg px-2.5 py-2 text-stone-100 text-[11px] focus:outline-none"
                  >
                    {albums.map(alb => (
                      <option key={alb.id} value={alb.id}>
                        {alb.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Confirm actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedPhotoPreview(null);
                      setCapturedPhotoCaption('');
                    }}
                    className="py-2.5 bg-stone-800/80 hover:bg-stone-850 text-stone-300 hover:text-white border border-stone-750 font-bold uppercase rounded-xl tracking-wide transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-stone-400" /> Retake
                  </button>
                  <button
                    type="button"
                    onClick={saveCapturedPhoto}
                    className="py-2.5 text-white bg-emerald-700 hover:bg-emerald-800 font-bold uppercase rounded-xl tracking-wide transition cursor-pointer flex items-center justify-center gap-1 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Polaroid
                  </button>
                </div>

              </div>
            ) : (
              <div className="space-y-3 font-mono">
                {/* Visual state guide */}
                <div className="flex items-center justify-between text-[9px] text-stone-400 bg-neutral-900/40 p-2.5 rounded-xl border border-stone-850">
                  <span>Snapping Contributor:</span>
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: getUserColorStyle(activeUser).hex }} />
                    <span style={{ color: getUserColorStyle(activeUser).hex }}>{getUserColorStyle(activeUser).displayName}</span>
                  </span>
                </div>

                {/* Control buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={toggleCameraFacingMode}
                    className="py-2.5 bg-[#2C2A26] border border-stone-800 text-stone-300 hover:text-white rounded-xl text-[9px] uppercase font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition"
                    title="Toggle Lens"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Lens</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Trigger normal browser file selector as direct fallback option
                      photoUploadInputRef.current?.click();
                    }}
                    className="py-2.5 bg-[#2C2A26]/80 border border-stone-800 text-purple-300 hover:text-purple-200 rounded-xl text-[9px] uppercase font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition"
                    title="Upload file"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={capturePhotoSnapshot}
                    className="py-2.5 text-white rounded-xl text-[9px] uppercase font-black flex flex-col items-center justify-center gap-1 cursor-pointer transition"
                    style={{ backgroundColor: getUserColorStyle(activeUser).hex }}
                    title="Snap Polaroid Shot"
                  >
                    <Camera className="w-3.5 h-3.5 text-white" />
                    <span>Snap</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* POLAROID MEMORY & ALBUM STUDIO MODAL */}
      {isPhotoStudioOpen && (
        <div className="fixed inset-0 bg-[#FAF9F5] z-50 flex flex-col animate-fade-in text-stone-900 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-white border-b border-stone-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">📸</span>
              <div>
                <h3 className="font-serif text-sm font-bold text-stone-900">Polaroid Album Studio</h3>
                <p className="font-mono text-[9px] text-[#7C7C59] tracking-wider uppercase font-black">Memory Organization Suite</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => {
                setIsPhotoStudioOpen(false);
                setMultiSelectActive(false);
                setSelectedPhotoIds([]);
              }}
              className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition cursor-pointer"
            >
              <X className="w-5 h-5 text-stone-600" />
            </button>
          </div>

          {/* Sub-header / Album lists & creation panel */}
          <div className="p-3 bg-stone-50 border-b border-stone-200 space-y-3 font-mono text-[10px]">
            {/* Action buttons and summary */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => {
                    setMultiSelectActive(!multiSelectActive);
                    setSelectedPhotoIds([]);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase transition flex items-center gap-1 shrink-0 cursor-pointer ${
                    multiSelectActive 
                      ? 'bg-purple-600 border-purple-700 text-white shadow-sm' 
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {multiSelectActive ? "✓ Select Mode" : "Select Multiple"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateAlbumPanelOpen(!isCreateAlbumPanelOpen)}
                  className="px-3 py-1.5 bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 rounded-lg text-[9px] font-bold uppercase transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-emerald-600" /> New Album
                </button>
                {activeStudioAlbumId && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDownloadAlbum(activeStudioAlbumId)}
                      className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[9px] font-bold uppercase transition flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Download Album
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareAlbum('AirDrop', activeStudioAlbumId)}
                      className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[9px] font-bold uppercase transition flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Share2 className="w-3 h-3" /> Share Album
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Slide-out Album Creation Form */}
            {isCreateAlbumPanelOpen && (
              <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-2 animate-fade-in">
                <p className="text-[9px] uppercase font-bold text-[#7C7C59] tracking-wider block">📂 Create Custom Photo Album:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAlbumNameInput}
                    onChange={(e) => setNewAlbumNameInput(e.target.value)}
                    placeholder="E.g., Coastal Sunsets, Coffee Stops..."
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-[11px] placeholder-stone-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = newAlbumNameInput.trim();
                      if (!trimmed) return;
                      const nextAlbum = {
                        id: 'album-' + generateId(),
                        name: trimmed,
                        createdAt: Date.now()
                      };
                      setAlbums(prev => [...prev, nextAlbum]);
                      setNewAlbumNameInput('');
                      setIsCreateAlbumPanelOpen(false);
                      setSuccessNotification(`Album "${trimmed}" created!`);
                      setTimeout(() => setSuccessNotification(null), 2500);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-black uppercase text-[9px] transition cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}

            {/* Album Tab Filters (Horizontal swipe) */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hidden">
              <button
                type="button"
                onClick={() => {
                  setActiveStudioAlbumId('all');
                  setSelectedPhotoIds([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 transition ${
                  activeStudioAlbumId === 'all'
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                📁 All photos
              </button>
              {albums.map(alb => (
                <button
                  key={alb.id}
                  type="button"
                  onClick={() => {
                    setActiveStudioAlbumId(alb.id);
                    setSelectedPhotoIds([]);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 transition ${
                    activeStudioAlbumId === alb.id
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  📁 {alb.name}
                </button>
              ))}
            </div>
          </div>

          {/* Core scrollable gallery area */}
          <div className="flex-1 overflow-y-auto p-4 bg-stone-50">
            {(() => {
              const activePhotos = photos.filter(p => {
                if ((p as any).status === 'deleted') return false;
                if (activeStudioAlbumId === 'all') return true;
                return (p as any).albumId === activeStudioAlbumId;
              });

              if (activePhotos.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center text-center py-16 space-y-2">
                    <span className="text-3xl text-stone-300">🖼️</span>
                    <p className="font-serif italic text-stone-400 text-[11px]">
                      No polaroid memories organized here yet.
                    </p>
                    <p className="font-mono text-[9px] text-stone-400">
                      Go to "All Photos", select memories, and move them here!
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-2 gap-4 pb-20">
                  {activePhotos.map(p => {
                    const isChecked = selectedPhotoIds.includes(p.id);
                    const cStyle = getUserColorStyle(p.addedBy);
                    const associatedTrip = trips.find(t => t.tripId === p.tripId);
                    const associatedAlbum = albums.find(alb => alb.id === (p as any).albumId);

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (multiSelectActive) {
                            if (isChecked) {
                              setSelectedPhotoIds(prev => prev.filter(id => id !== p.id));
                            } else {
                              setSelectedPhotoIds(prev => [...prev, p.id]);
                            }
                          } else {
                            setSelectedPhotoForDetail(p);
                          }
                        }}
                        className={`bg-white p-2 pb-3.5 border shadow-md rounded-lg relative group transition-all duration-200 ${
                          multiSelectActive ? 'cursor-pointer' : ''
                        } ${isChecked ? 'ring-2 ring-purple-600 scale-[0.98]' : 'hover:scale-[1.01]'}`}
                        style={{ borderColor: cStyle.hex + '2e', borderBottomColor: cStyle.hex + '9a', borderBottomWidth: '4px' }}
                      >
                        {/* Checkbox overlay if selectors active */}
                        {multiSelectActive && (
                          <div className="absolute top-2 left-2 z-10 w-5 h-5 rounded-md border flex items-center justify-center bg-white border-stone-300" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPhotoIds(prev => [...prev, p.id]);
                                } else {
                                  setSelectedPhotoIds(prev => prev.filter(id => id !== p.id));
                                }
                              }}
                              className="w-3.5 h-3.5 accent-purple-600 cursor-pointer"
                            />
                          </div>
                        )}

                        <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden rounded">
                          <img
                            src={p.url}
                            alt={p.caption}
                            className="w-full h-full object-cover rounded shadow-inner"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Caption and description info */}
                        <div className="pt-2 text-[8px] font-mono leading-tight space-y-1">
                          <p className="font-serif italic font-bold text-stone-850 truncate">"{p.caption}"</p>
                          
                          <div className="flex items-center justify-between text-[7px] text-stone-400">
                            <span>{p.timestamp}</span>
                            <span className="font-black px-1 rounded uppercase" style={{ backgroundColor: cStyle.hex + '1a', color: cStyle.hex }}>
                              {cStyle.displayName}
                            </span>
                          </div>

                          {/* Quick details & selectors (non-multiselect inline transfers) */}
                          <div className="pt-2 border-t border-stone-100 space-y-1 text-[7.5px]" onClick={(e) => e.stopPropagation()}>
                            {/* Trip Selection dropdown list */}
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-stone-400 shrink-0">Trip:</span>
                              <select
                                value={p.tripId || ''}
                                onChange={(e) => {
                                  const targetTripId = e.target.value;
                                  const targetTrip = trips.find(t => t.tripId === targetTripId);
                                  setPhotos(prev => prev.map(item => {
                                    if (item.id === p.id) {
                                      return { 
                                        ...item, 
                                        tripId: targetTripId, 
                                        location: targetTrip ? targetTrip.destination : 'Nova Scotia Corridor' 
                                      };
                                    }
                                    return item;
                                  }));
                                  setSuccessNotification(`Polaroid re-routed successfully.`);
                                  setTimeout(() => setSuccessNotification(null), 2500);
                                }}
                                className="bg-stone-50 border border-stone-200 text-[7px] p-0.5 rounded focus:outline-none truncate max-w-[100px]"
                              >
                                {trips.filter(t => t.status !== 'deleted').map(t => (
                                  <option key={t.tripId} value={t.tripId}>{t.title}</option>
                                ))}
                              </select>
                            </div>

                            {/* Album Selection dropdown list */}
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-stone-400 shrink-0">Album:</span>
                              <select
                                value={(p as any).albumId || ''}
                                onChange={(e) => {
                                  const targetAlbId = e.target.value;
                                  setPhotos(prev => prev.map(item => {
                                    if (item.id === p.id) {
                                      return { ...item, albumId: targetAlbId } as any;
                                    }
                                    return item;
                                  }));
                                  setSuccessNotification(`Polaroid assigned to new album.`);
                                  setTimeout(() => setSuccessNotification(null), 2500);
                                }}
                                className="bg-stone-50 border border-stone-200 text-[7px] p-0.5 rounded focus:outline-none truncate max-w-[100px]"
                              >
                                <option value="">(None)</option>
                                {albums.map(alb => (
                                  <option key={alb.id} value={alb.id}>{alb.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Sticky Multi-Select Action Panel at bottom */}
          {multiSelectActive && selectedPhotoIds.length > 0 && (
            <div className="absolute bottom-0 inset-x-0 bg-stone-900 text-white p-3 border-t border-stone-800 flex flex-col gap-2.5 font-mono text-[9px] animate-slide-up shadow-2xl z-20">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  {selectedPhotoIds.length} polaroids selected
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIds([])}
                  className="text-stone-400 hover:text-white uppercase font-bold text-[8.5px] cursor-pointer"
                >
                  Clear check
                </button>
              </div>

              {/* Action buttons (Move to Trip, Move to Album, Bulk Delete) */}
              <div className="grid grid-cols-4 gap-1.5">
                {/* 1. Trip transfer dropdown action */}
                <div className="bg-stone-800 p-1.5 rounded-lg border border-stone-750 flex flex-col gap-1">
                  <span className="text-[7.5px] uppercase font-bold text-stone-500 text-center">Transfer Trip</span>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) return;
                      const targetTrip = trips.find(t1 => t1.tripId === value);
                      setPhotos(prev => prev.map(p => {
                        if (selectedPhotoIds.includes(p.id)) {
                          return { ...p, tripId: value, location: targetTrip ? targetTrip.destination : p.location };
                        }
                        return p;
                      }));
                      setSelectedPhotoIds([]);
                      setSuccessNotification(`Moved ${selectedPhotoIds.length} polaroids to selected trip.`);
                      setTimeout(() => setSuccessNotification(null), 3000);
                    }}
                    className="w-full bg-stone-950 text-white border-0 text-[8px] focus:outline-none p-0.5"
                    defaultValue=""
                  >
                    <option value="" disabled>Select</option>
                    {trips.filter(t => t.status !== 'deleted').map(t => (
                      <option key={t.tripId} value={t.tripId}>{t.title}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Album transfer dropdown action */}
                <div className="bg-stone-800 p-1.5 rounded-lg border border-stone-750 flex flex-col gap-1">
                  <span className="text-[7.5px] uppercase font-bold text-stone-500 text-center">Move Album</span>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) return;
                      setPhotos(prev => prev.map(p => {
                        if (selectedPhotoIds.includes(p.id)) {
                          return { ...p, albumId: value } as any;
                        }
                        return p;
                      }));
                      setSelectedPhotoIds([]);
                      setSuccessNotification(`Moved ${selectedPhotoIds.length} polaroids to album.`);
                      setTimeout(() => setSuccessNotification(null), 3000);
                    }}
                    className="w-full bg-stone-950 text-white border-0 text-[8px] focus:outline-none p-0.5"
                    defaultValue=""
                  >
                    <option value="" disabled>Select</option>
                    {albums.map(alb => (
                      <option key={alb.id} value={alb.id}>{alb.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Bulk Share */}
                <button
                  type="button"
                  onClick={() => handleShareMany('airdrop', selectedPhotoIds)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex flex-col items-center justify-center gap-0.5 uppercase font-black transition text-[7.5px] cursor-pointer"
                >
                  <Share2 className="w-3 h-3 shrink-0" />
                  <span>Share</span>
                </button>

                {/* 4. Bulk delete action */}
                <button
                  type="button"
                  onClick={() => {
                    setPhotos(prev => prev.map(p => {
                      if (selectedPhotoIds.includes(p.id)) {
                        return { ...p, status: 'deleted', deletedAt: Date.now() } as any;
                      }
                      return p;
                    }));
                    setSelectedPhotoIds([]);
                    setSuccessNotification(`Moved selected polaroids to Trash Room.`);
                    setTimeout(() => setSuccessNotification(null), 3000);
                  }}
                  className="bg-red-650 hover:bg-red-700 text-white rounded-lg flex flex-col items-center justify-center gap-0.5 uppercase font-black transition text-[7.5px] cursor-pointer"
                  title="Move selected items to Recycle Bin"
                >
                  <Trash2 className="w-3 h-3 shrink-0" />
                  <span>Trash</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* POLAROID DETAIL VIEW & SOCIAL SHARING SHEET MODAL */}
      {selectedPhotoForDetail && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-55 animate-fade-in">
          <div className="bg-[#FAF9F5] shadow-2xl max-w-sm w-full rounded-2xl p-4 text-[#141312] border-4 border-[#ECE6DF] flex flex-col space-y-4">
            
            {/* Header Detail Close */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-stone-500 font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-600" />
                <span>{selectedPhotoForDetail.location || 'Nova Scotia Corridor'}</span>
              </span>
              <button 
                type="button"
                onClick={() => setSelectedPhotoForDetail(null)}
                className="w-6 h-6 rounded-full bg-stone-200/80 flex items-center justify-center text-stone-700 hover:bg-stone-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* POLAROID WHITE CARD MOCKUP */}
            <div className="bg-white p-3 shadow-md rounded border border-stone-100 flex flex-col space-y-3">
              <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden rounded border border-stone-100">
                <img 
                  src={selectedPhotoForDetail.url} 
                  alt={selectedPhotoForDetail.caption} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-mono text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getUserColorStyle(selectedPhotoForDetail.addedBy).hex }} />
                  <span>Added by {selectedPhotoForDetail.addedBy}</span>
                </div>
              </div>
              
              <div className="pt-2 text-center">
                <p className="font-serif italic text-sm text-stone-800 leading-snug font-semibold">
                  "{selectedPhotoForDetail.caption}"
                </p>
                <p className="font-mono text-[8px] uppercase tracking-wider text-stone-400 mt-2">
                  Road Trip Log: {selectedPhotoForDetail.timestamp || '02:40 PM'} • Coordinate Locked
                </p>
              </div>
            </div>

            {/* METADATA INFO */}
            <div className="bg-stone-100/85 p-3 rounded-xl border border-stone-200 text-[10px] font-mono text-stone-600 space-y-1.5">
              <div className="flex justify-between">
                <span>Contributor Name:</span>
                <span className="font-bold uppercase" style={{ color: getUserColorStyle(selectedPhotoForDetail.addedBy).hex }}>
                  {getUserColorStyle(selectedPhotoForDetail.addedBy).displayName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trip Association:</span>
                <span className="font-bold text-stone-800">
                  {trips.find(t => t.tripId === selectedPhotoForDetail.tripId)?.title || 'Cape Breton Blueprint'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sync Node Status:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> Device Vault
                </span>
              </div>
            </div>

            {/* SHARING SHEET ACTIONS */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest block font-bold">📡 Direct Sharing Channels:</span>
              <div className="grid grid-cols-4 gap-1.5 font-mono">
                <button
                  type="button"
                  onClick={() => handleSharePhoto('text', selectedPhotoForDetail)}
                  className="py-2.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[9px] uppercase font-bold text-stone-700 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                  title="SMS to Partner"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSharePhoto('email', selectedPhotoForDetail)}
                  className="py-2.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[9px] uppercase font-bold text-stone-700 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                  title="Email to Family"
                >
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSharePhoto('airdrop', selectedPhotoForDetail)}
                  className="py-2.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[9px] uppercase font-bold text-stone-700 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                  title="AirDrop or Bluetooth Node share"
                >
                  <Radio className="w-4 h-4 text-indigo-600" />
                  <span>AirDrop</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSharePhoto('link', selectedPhotoForDetail)}
                  className="py-2.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[9px] uppercase font-bold text-stone-700 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                  title="Copy Direct Base64 URI Link"
                >
                  <Share2 className="w-4 h-4 text-amber-600" />
                  <span>Link</span>
                </button>
              </div>

              {/* ACTION FOOTER OPERATIONS (DOWNLOAD, TRASH) */}
              <div className="flex gap-2 pt-2 border-t border-stone-200">
                <a
                  href={selectedPhotoForDetail.url}
                  download={`roamie_polaroid_${selectedPhotoForDetail.id}.jpg`}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] uppercase font-black text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                  onClick={() => {
                    setSuccessNotification("Polaroid image download initialized.");
                    setTimeout(() => setSuccessNotification(null), 3000);
                  }}
                >
                  <Download className="w-4 h-4" /> Download Photo
                </a>
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(selectedPhotoForDetail.id)}
                  className="px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition cursor-pointer"
                  title="Move Polaroid to Trash Room"
                >
                  <Trash2 className="w-4 h-4 text-red-650" />
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* VEHICLE COCKPIT BLUETOOTH MANAGER OVERLAY */}
      {isBluetoothModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-mono text-[10px]">
          <div className="bg-[#1C1A18] max-w-sm w-full rounded-2xl p-5 border border-[#3A2218]/40 shadow-2xl space-y-3.5 text-stone-350 text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-850 pb-2.5">
              <div className="flex items-center gap-2">
                <Bluetooth className="w-4 h-4 text-indigo-400 animate-pulse" />
                <h3 className="font-serif text-xs font-black text-[#FAF9F5] uppercase tracking-wider">On-Board audio stream link</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsBluetoothModalOpen(false)}
                className="text-stone-500 hover:text-white p-1 hover:bg-stone-900 rounded-lg transition-all cursor-pointer focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scanning Progress Console */}
            <div className="bg-[#121110] border border-stone-850 p-3 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[9px] font-bold">
                <span className="text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                  {isBluetoothScanning ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                      </span>
                      <span>ACTIVE SCANNING...</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>DISCOVERY FINISHED</span>
                    </>
                  )}
                </span>
                <span className="text-indigo-400 text-[8px] font-mono">{bluetoothScanProgress}% ready</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-stone-900 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-1 transition-all duration-300" 
                  style={{ width: `${bluetoothScanProgress}%` }}
                />
              </div>

              {/* Dynamic Status Log Line */}
              <p className="text-[7.5px] font-mono text-[#7C7C59] uppercase truncate">
                {isBluetoothScanning 
                  ? `[LNK] Poll frequency band... Found ${scannedBluetoothDevices.length} nodes` 
                  : bluetoothError || `[LNK] Scan result stable. Select a connection line.`}
              </p>
            </div>

            {/* Found Devices List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <span className="text-[8px] text-stone-500 uppercase tracking-widest font-black block pb-1 border-b border-stone-900">Nearby Bluetooth Streams</span>
              
              {scannedBluetoothDevices.length === 0 ? (
                <div className="py-8 text-center text-stone-600 font-serif">
                  No nearby vehicle systems seen yet. Let the cockpit scan...
                </div>
              ) : (
                scannedBluetoothDevices.map((dev) => {
                  const isConnectedToThis = isBluetoothConnected && selectedBluetoothDeviceName === dev.name;
                  const isPairingThis = isPairingDeviceName === dev.name;

                  return (
                    <div 
                      key={dev.name}
                      onClick={() => !isPairingThis && !isConnectedToThis && connectToScannedDevice(dev.name)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-1 transition-all text-left ${
                        isConnectedToThis 
                          ? 'bg-indigo-950/45 border-indigo-500/60 text-indigo-200' 
                          : isPairingThis 
                          ? 'bg-[#2E2818]/60 border-amber-600/40 text-amber-200 animate-pulse'
                          : 'bg-[#141312] border-stone-850 hover:border-indigo-950 hover:bg-[#181615] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {dev.type === 'car' ? (
                          <Car className={`w-3.5 h-3.5 ${isConnectedToThis ? 'text-indigo-400' : 'text-stone-500'}`} />
                        ) : dev.type === 'headphones' ? (
                          <Headphones className={`w-3.5 h-3.5 ${isConnectedToThis ? 'text-indigo-400' : 'text-stone-500'}`} />
                        ) : (
                          <Radio className={`w-3.5 h-3.5 ${isConnectedToThis ? 'text-indigo-400' : 'text-stone-500'}`} />
                        )}
                        <div>
                          <p className="font-bold text-[9px] text-stone-200 leading-tight">{dev.name}</p>
                          <p className="text-[7.5px] text-stone-500">{dev.address} • Signal: {dev.rssi} dBm</p>
                        </div>
                      </div>

                      <div>
                        {isConnectedToThis ? (
                          <span className="text-[7.5px] font-mono uppercase bg-indigo-950 text-indigo-400 border border-indigo-900 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 animate-pulse">
                            <Check className="w-2.5 h-2.5" /> ACTIVE
                          </span>
                        ) : isPairingThis ? (
                          <span className="text-[7.5px] font-mono bg-amber-950 text-amber-400 border border-amber-900 px-1.5 py-0.5 rounded font-black animate-pulse">
                            COUPLING...
                          </span>
                        ) : (
                          <span className="text-[7.5px] font-mono text-stone-400 uppercase hover:text-white transition font-bold px-2 py-0.5 bg-stone-900 border border-stone-800 rounded">
                            Connect
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Direct Native Android & Chrome System Links */}
            <div className="p-3 bg-[#1B120F]/50 border border-stone-850 rounded-xl space-y-2">
              <span className="text-[7.5px] text-stone-500 uppercase tracking-widest font-black block">🔗 OS Native System Dispatchers</span>
              <p className="text-[8px] text-stone-400 leading-relaxed font-serif">
                Web sandboxes often require user interaction gestures or distinct permission overrides. Tap below to launch your platform's native Bluetooth settings:
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    // Force chrome/browser native BT Dialog
                    if (typeof window !== 'undefined' && (navigator as any).bluetooth) {
                      try {
                        const dev = await (navigator as any).bluetooth.requestDevice({ acceptAllDevices: true });
                        if (dev) {
                          setSelectedBluetoothDeviceName(dev.name || "Bluetooth Onboard Target");
                          setIsBluetoothConnected(true);
                          setIsBluetoothModalOpen(false);
                          speakText(`Successfully paired with ${dev.name || "Bluetooth Target"}`);
                        }
                      } catch (err: any) {
                        alert(`Browser standard BT API: ${err.message || 'Prompt cancelled or blocked'}`);
                      }
                    } else {
                      alert("Web Bluetooth API is not supported on this browser context.");
                    }
                  }}
                  className="p-1 px-2 text-[7.5px] font-mono uppercase font-black tracking-wider text-indigo-400 bg-indigo-950/50 border border-indigo-900 hover:bg-indigo-900/60 rounded text-center transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Link2 className="w-2.5 h-2.5" /> Browser API
                </button>
                <button
                  type="button"
                  onClick={handleLaunchAndroidBluetoothSettings}
                  className="p-1 px-2 text-[7.5px] font-mono uppercase font-black tracking-wider text-amber-500 bg-amber-950/40 border border-amber-900 hover:bg-amber-900/40 rounded text-center transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Smartphone className="w-2.5 h-2.5" /> Android settings
                </button>
              </div>
            </div>

            {/* Interactive Refresh Scan */}
            <div className="flex justify-between items-center text-[8.5px] border-t border-stone-900 pt-3">
              <span className="text-stone-500 font-serif">A2DP Stereo Stream Routing</span>
              <button 
                type="button"
                onClick={startBluetoothScan}
                disabled={isBluetoothScanning}
                className="flex items-center gap-1 text-[#7C7C59] hover:text-[#9A9A6D] text-[8.5px] uppercase font-mono font-bold leading-none cursor-pointer focus:outline-none"
              >
                <RefreshCw className={`w-3 h-3 ${isBluetoothScanning ? 'animate-spin' : ''}`} />
                <span>Re-Scan Airwaves</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* NATIVE NAVIGATION APP FALLBACK ACTION POPUP */}
      <AnimatePresence>
        {navigationErrorTarget && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-55 bg-[#FAF9F5] border border-stone-300 text-stone-900 p-5 rounded-2xl shadow-2xl flex flex-col items-center gap-3 max-w-sm w-[90%] mx-auto text-center"
          >
            <div className="p-3 bg-red-50 text-red-600 rounded-full">
              <MapPin className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm tracking-tight text-stone-900">Native Launch Prevented</h4>
              <p className="font-sans text-[11px] text-stone-500 mt-1 leading-relaxed">
                Roamie tried to launch turn-by-turn navigation for <strong className="text-stone-800">{navigationErrorTarget.label}</strong>, but your browser blocked the application protocol.
              </p>
            </div>
            <div className="flex gap-2 w-full mt-1">
              <button
                type="button"
                onClick={() => setNavigationErrorTarget(null)}
                className="flex-1 py-1.5 font-sans font-medium text-[11px] border border-stone-300 hover:bg-stone-50 text-stone-600 rounded-lg transition cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(navigationErrorTarget.query)}`;
                  window.open(url, '_blank');
                  setNavigationErrorTarget(null);
                }}
                className="flex-1 py-1.5 font-sans font-bold text-[11px] bg-[#1E1C1A] hover:bg-stone-800 text-[#FAF9F5] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Compass className="w-3 h-3" />
                Open in Maps
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST SUCCESS NOTIFICATION WITH CHECKCIRCLE2 */}
      <AnimatePresence>
        {successNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-55 bg-[#1E1C1A] border border-emerald-500/50 text-[#FAF9F5] px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 max-w-sm w-[90%] mx-auto"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-mono text-[10px] font-bold tracking-wide">{successNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PERSISTENT ALWAYS-VISIBLE MUSIC COORDINATORS (DYNAMIC LABELS ACTIVED BY ADMIN PANEL) */}
      <div className="fixed bottom-16 right-4 z-40 flex items-center gap-1.5 flex-wrap justify-end">
        {musicProviders
          .filter(p => p.status === 'enabled')
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(prov => {
            const isAmazon = prov.id === 'amazon';
            
            const themeClasses = isAmazon 
              ? 'bg-[#00A8E1] hover:bg-[#0090c2] text-black border border-[#232F3E]' 
              : 'bg-[#1E1C1A] hover:bg-stone-900 text-stone-200 border border-stone-850';

            return (
              <button
                key={prov.id}
                type="button"
                onClick={() => {
                  window.open(prov.deepLink, '_blank');
                }}
                className={`p-2 px-2.5 rounded-full font-sans text-[8.5px] font-black uppercase tracking-wider shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-1 leading-none ${themeClasses}`}
                title={`Open ${prov.name} in New Tab`}
              >
                <span className="relative flex h-1 w-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1 w-1 bg-current"></span>
                </span>
                <span className="text-[10px] sm:inline">{prov.logo}</span>
                <span>{prov.name}</span>
              </button>
            );
          })}
      </div>

      {/* DEVELOPER DEBUG PANEL (PRIORITY 1 REQUIREMENTS) */}
      {profile.settings.developerDebugMode && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-60 bg-[#141211] border-t border-rose-500/50 text-[#ECE6DF] p-4 max-w-sm w-[90%] font-mono text-[9px] shadow-2xl space-y-2 max-h-[300px] overflow-y-auto mb-1 rounded-t-2xl">
          <div className="flex items-center justify-between border-b border-stone-850 pb-1.5 pt-0.5">
            <span className="text-[10px] text-rose-400 font-extrabold tracking-wider uppercase flex items-center gap-1.5 leading-none">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block" />
              Dev Diagnostics HUD
            </span>
            <button 
              onClick={() => setProfile(prev => ({ ...prev, settings: { ...prev.settings, developerDebugMode: false } }))}
              className="text-stone-500 hover:text-stone-300 uppercase scale-90 cursor-pointer font-bold font-mono focus:outline-none"
            >
              [Close]
            </button>
          </div>
          <div className="space-y-2 text-left">
            <div>
              <span className="text-stone-500 font-black uppercase tracking-wider block text-[8px] mb-0.5">🎤 User Spoke (Transcript):</span>
              <p className="text-stone-200 bg-stone-950 p-1.5 rounded border border-stone-900 break-words font-sans text-[9.5px] leading-snug font-medium">
                {debugLatestUserSaid || "(Silence / Waiting...)"}
              </p>
            </div>
            <div>
              <span className="text-stone-500 font-black uppercase tracking-wider block text-[8px] mb-0.5">🧠 Payload Transmitted To AI:</span>
              <p className="text-stone-200 bg-stone-950 p-1.5 rounded border border-stone-900 break-words font-sans text-[9.5px] leading-snug font-medium">
                {debugLatestSentToAI || "(None)"}
              </p>
            </div>
            <div>
              <span className="text-stone-500 font-black uppercase tracking-wider block text-[8px] mb-0.5">🎯 Intent Registered:</span>
              <p className="text-rose-400 font-bold bg-stone-950 p-1 rounded border border-stone-900 font-mono text-[9px]">
                {debugLatestIntent || "STDBY / UNKNOWN"}
              </p>
            </div>
            <div>
              <span className="text-stone-500 font-black uppercase tracking-wider block text-[8px] mb-0.5">🤖 AI Text-To-Speech Response:</span>
              <p className="text-stone-200 bg-stone-950 p-1.5 rounded border border-stone-900 break-words font-sans text-[9.5px] leading-snug font-medium">
                {debugLatestAIResponse || "(None)"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1.5 text-[8.5px] uppercase font-bold border-t border-stone-900/40">
              <div>
                <span className="text-stone-500 block text-[7.5px] font-black">Voice Status:</span>
                <span className={roamieState === 'speaking' ? 'text-purple-400 animate-pulse' : roamieState === 'listening' ? 'text-rose-400 animate-pulse' : 'text-stone-400 font-mono'}>
                  {roamieState === 'speaking' ? '🗣️ Speaking' : roamieState === 'listening' ? '🎤 Listening' : roamieState === 'processing' ? '⚙️ Processing' : '💤 Idle'}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block text-[7.5px] font-black">Current State:</span>
                <span className="text-[#ECE6DF] font-mono font-bold">
                  {roamieState.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
