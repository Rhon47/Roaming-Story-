export interface UserBranding {
  logoUrl: string | null;
  logoLocked: boolean;
  avatarUrl: string | null;
  avatarLocked: boolean;
  allowAiReplacement?: boolean;
  persistAssets?: boolean;
}

export interface UserSettings {
  voiceEnabled: boolean;
  responseMode: 'text' | 'voice' | 'combined';
  handsFreeEnabled?: boolean;
  smartInterruptEnabled?: boolean;
  voiceAssistanceMode?: 'drive' | 'third_wheel';
  developerDebugMode?: boolean;
  alwaysOnWakeWordEnabled?: boolean;
}

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  branding: UserBranding;
  settings: UserSettings;
}

export interface Activity {
  time: 'morning' | 'afternoon' | 'evening' | 'custom';
  title: string;
  description: string;
  savedByAI: boolean;
  addedBy?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  activities: Activity[];
}

export interface SavedIdea {
  text: string;
  createdAt: number;
  addedBy?: string;
}

export interface Trip {
  tripId: string;
  userId: string;
  type: 'current' | 'upcoming';
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'planned' | 'active' | 'completed' | 'upcoming' | 'current' | 'past' | 'deleted';
  itinerary: {
    days: ItineraryDay[];
  };
  savedIdeas: SavedIdea[];
  deletedAt?: number;
  canRestore?: boolean;
}

export interface ChatLogMessage {
  id: string; // Unique message id for rendering list keys
  role: 'user' | 'avatar';
  type: 'text' | 'voice';
  content: string;
  timestamp: number;
  photoUrl?: string; // Optional image upload support
  senderName: 'Rhonda' | 'Susan' | 'Roamie';
}

export interface TripChat {
  chatId: string;
  tripId: string;
  userId: string;
  messages: ChatLogMessage[];
}

export interface TripPhoto {
  id: string;
  url: string;
  caption: string;
  addedBy: 'Rhonda' | 'Susan';
  timestamp: string;
  tripId?: string;
  location?: string;
  status?: 'deleted';
  deletedAt?: number;
}

export interface Traveler {
  userId: string;
  name: 'Rhonda' | 'Susan';
  displayName: string;
  accentColor: string; // Hex color code
  role: string; // role e.g. partner, navigator
  avatarUrl?: string; // custom avatar
  bubbleStyle?: 'solid' | 'bordered' | 'playful';
}

