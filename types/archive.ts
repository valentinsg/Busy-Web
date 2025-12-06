export interface ArchiveEntry {
  id: string;
  title?: string;
  thumb_url: string;
  medium_url: string;
  full_url: string;
  colors: string[];
  mood: string[];
  place?: string;
  person?: string;
  tags: string[];
  microcopy?: string;
  likes: number;
  views: number;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ArchiveFilters {
  color?: string;
  mood?: string[];
  tags?: string[];
  place?: string;
  person?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
  total: number;
}

export interface UploadResponse {
  id: string;
  urls: {
    thumb: string;
    medium: string;
    full: string;
  };
  colors: string[];
}

export interface RecommendationRequest {
  id: string;
  limit?: number;
}

export interface ShareCardProps {
  title: string;
  description: string;
  imageUrl: string;
  colors: string[];
  mood: string[];
  timestamp: string;
}

export interface ArchiveStats {
  totalEntries: number;
  totalLikes: number;
  totalViews: number;
  topTags: { tag: string; count: number }[];
  topPlaces: { place: string; count: number }[];
  topMoods: { mood: string; count: number }[];
}

export interface ArchiveUploadOptions {
  file: File;
  metadata: {
    microcopy?: string;
    mood?: string[];
    tags?: string[];
    place?: string;
    person?: string;
    isPublic?: boolean;
  };
}

export interface ArchiveUpdateOptions {
  id: string;
  updates: {
    microcopy?: string;
    mood?: string[];
    tags?: string[];
    place?: string | null;
    person?: string | null;
    is_public?: boolean;
  };
}

export interface ArchiveSearchResult {
  entries: ArchiveEntry[];
  filters: {
    moods: { value: string; count: number }[];
    places: { value: string; count: number }[];
    people: { value: string; count: number }[];
    tags: { value: string; count: number }[];
  };
  total: number;
  page: number;
  totalPages: number;
}

// Types for the admin interface
export interface AdminArchiveStats {
  totalEntries: number;
  totalStorage: number; // in bytes
  entriesByMonth: { month: string; count: number }[];
  popularTags: { tag: string; count: number }[];
  recentActivity: {
    id: string;
    action: 'upload' | 'update' | 'delete' | 'like' | 'view';
    entryId: string;
    userId?: string;
    timestamp: string;
  }[];
}

// Types for the timeline view
export interface TimelineEntry extends ArchiveEntry {
  year: number;
  month: number;
  day: number;
}

export interface TimelineGroup {
  year: number;
  months: {
    month: number;
    monthName: string;
    entries: TimelineEntry[];
  }[];
}

// Types for the playlist feature
export interface PlaylistItem {
  id: string;
  entryId: string;
  position: number;
  addedAt: string;
  entry: ArchiveEntry;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  items: PlaylistItem[];
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  itemCount: number;
}

// Types for the share card generator
export interface ShareCardOptions {
  entry: ArchiveEntry;
  template?: 'default' | 'minimal' | 'vibrant';
  includeWatermark?: boolean;
  includeMetadata?: boolean;
  customText?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

// Types for the vibes mode
export interface VibesModeSettings {
  intensity: number; // 0-100
  blur: number; // 0-20
  saturation: number; // 0-200
  brightness: number; // 0-200
  contrast: number; // 0-200
  colorize: string; // hex color or 'auto'
  overlayOpacity: number; // 0-100
  animationSpeed: 'slow' | 'normal' | 'fast';
  colorScheme: 'vibrant' | 'muted' | 'monochrome' | 'custom';
  customColors?: string[];
}

// Types for the film strip mode
export interface FilmStripSettings {
  showThumbnails: boolean;
  showInfo: boolean;
  showNavigation: boolean;
  autoPlay: boolean;
  loop: boolean;
  speed: number; // 1-10
  direction: 'horizontal' | 'vertical';
  spacing: number; // in pixels
  padding: number; // in pixels
  backgroundColor: string; // hex color
  showOverlay: boolean;
  overlayOpacity: number; // 0-100
}

// Types for the recommendation system
export interface RecommendationScore {
  entryId: string;
  score: number;
  factors: {
    color: number;
    mood: number;
    place: number;
    tags: number;
    recency: number;
    popularity: number;
  };
  entry: ArchiveEntry;
}

export interface RecommendationOptions {
  limit?: number;
  minScore?: number;
  maxResults?: number;
  boostRecent?: boolean;
  boostPopular?: boolean;
  excludeIds?: string[];
  includeFactors?: boolean;
}

export interface UploadResponse {
  id: string;
  thumb_url: string;
  medium_url: string;
  full_url: string;
  colors: string[];
}

export interface RecommendationRequest {
  id: string;
  limit?: number;
}

export interface ShareCardProps {
  entry: ArchiveEntry;
  variant?: 'horizontal' | 'vertical';
}
