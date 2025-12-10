export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  category: string;
  location: Location;
  rating?: number;
  images?: string[];
  audioUrl?: string;
  openingHours?: {
    [key: string]: string;
  };
  ticketPrice?: {
    adult: number;
    child: number;
    student: number;
  };
  facilities?: string[];
  tags?: string[];
  estimatedVisitDuration?: number; // in minutes
  bestVisitTime?: string[];
  seasonality?: string[];
}

export interface SearchResult {
  id: string;
  name: string;
  category: string;
  location: Location;
  distance?: number;
  rating?: number;
  image?: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  url: string;
  duration: number;
  attractionId: string;
  localPath?: string;
  isDownloaded?: boolean;
  downloadProgress?: number;
}

export interface UserPreferences {
  language: string;
  autoPlayAudio: boolean;
  downloadQuality: 'low' | 'medium' | 'high';
  mapType: 'standard' | 'satellite' | 'hybrid';
  notificationEnabled: boolean;
  locationTrackingEnabled: boolean;
}

export interface RecentSearch {
  query: string;
  timestamp: number;
  resultCount: number;
}

export interface OfflineData {
  attractions: Attraction[];
  lastUpdated: number;
  version: string;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  attractions: string[]; // attraction IDs
  estimatedDuration: number; // in minutes
  distance: number; // in meters
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface NavigationState {
  isNavigating: boolean;
  currentRoute?: Route;
  currentDestination?: Attraction;
  nextWaypoint?: Location;
  progress: number; // percentage
  estimatedArrival?: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterOptions {
  categories?: string[];
  rating?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  distance?: number;
  facilities?: string[];
  tags?: string[];
  isOpen?: boolean;
}

export interface SortOption {
  field: 'name' | 'rating' | 'distance' | 'price' | 'popularity';
  order: 'asc' | 'desc';
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapMarker {
  id: string;
  coordinate: Location;
  title: string;
  description?: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'transport' | 'custom';
  icon?: string;
}

export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
  details?: any;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface AppState {
  userPreferences: UserPreferences;
  location: Location | null;
  isLocationEnabled: boolean;
  networkStatus: 'online' | 'offline' | 'unknown';
  error: ErrorState;
  loading: LoadingState;
}