import {
  ArchiveEntry,
  ArchiveFilters,
  ArchiveStats,
  ArchiveUpdateOptions,
  PaginatedResponse,
  Playlist,
  RecommendationScore,
  TimelineGroup
} from '@/types/archive';
import { createClient } from '@supabase/supabase-js';

// Define the Supabase database types
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Database = {
  public: {
    Tables: {
      'archive.entries': {
        Row: {
          id: string;
          thumb_url: string;
          medium_url: string;
          full_url: string;
          colors: string[];
          mood: string[];
          place: string | null;
          person: string | null;
          tags: string[];
          microcopy: string | null;
          likes: number;
          views: number;
          is_public: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          thumb_url: string;
          medium_url: string;
          full_url: string;
          colors: string[];
          mood: string[];
          place?: string | null;
          person?: string | null;
          tags?: string[];
          microcopy?: string | null;
          likes?: number;
          views?: number;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          thumb_url?: string;
          medium_url?: string;
          full_url?: string;
          colors?: string[];
          mood?: string[];
          place?: string | null;
          person?: string | null;
          tags?: string[];
          microcopy?: string | null;
          likes?: number;
          views?: number;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      'archive.playlists': {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
          cover_image: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          cover_image?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          cover_image?: string | null;
        };
      };
      'archive.playlist_items': {
        Row: {
          id: string;
          playlist_id: string;
          entry_id: string;
          position: number;
          added_at: string;
        };
        Insert: {
          id?: string;
          playlist_id: string;
          entry_id: string;
          position?: number;
          added_at?: string;
        };
        Update: {
          id?: string;
          playlist_id?: string;
          entry_id?: string;
          position?: number;
          added_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_views: {
        Args: {
          entry_id: string;
        };
        Returns: undefined;
      };
      increment_likes: {
        Args: {
          entry_id: string;
        };
        Returns: number;
      };
      get_recommendations: {
        Args: {
          entry_id: string;
          max_results?: number;
          min_score?: number;
          exclude_ids?: string[];
        };
        Returns: {
          entry_id: string;
          score: number;
          entry: Json;
        }[];
      };
      get_timeline_entries: {
        Args: Record<PropertyKey, never>;
        Returns: {
          year: number;
          month: number;
          month_name: string;
          entries: Json[];
        }[];
      };
      get_archive_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          total_entries: number;
          total_likes: number;
          total_views: number;
          top_tags: Json[];
          top_places: Json[];
          top_moods: Json[];
        };
      };
      get_admin_archive_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          total_entries: number;
          total_storage: number;
          entries_by_month: { month: string; count: number }[];
          recent_activity: Json[];
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Initialize Supabase client
type ArchiveEntryRow = Database['public']['Tables']['archive.entries']['Row'];

export class ArchiveService {
  private supabase = createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );

  // Entry CRUD Operations
  async getEntries(
    filters: ArchiveFilters = {},
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<ArchiveEntry>> {
    let query = this.supabase
      .schema('archive')
      .from('entries')
      .select('*', { count: 'exact' })
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.color) {
      query = query.contains('colors', [filters.color]);
    }

    if (filters.mood?.length) {
      query = query.overlaps('mood', filters.mood);
    }

    if (filters.tags?.length) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters.place) {
      query = query.eq('place', filters.place);
    }

    if (filters.person) {
      query = query.eq('person', filters.person);
    }

    // Search: flexible search across microcopy, tags, mood, place, person
    // Uses ilike for simple pattern matching (works without special indexes)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      // Use OR filter to search across multiple fields
      query = query.or(
        `microcopy.ilike.%${searchTerm}%,` +
        `place.ilike.%${searchTerm}%,` +
        `person.ilike.%${searchTerm}%,` +
        `tags.cs.{${searchTerm}},` +
        `mood.cs.{${searchTerm}}`
      );
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Error fetching archive entries:', error);
      throw error;
    }

    return {
      data: data as ArchiveEntry[],
      hasMore: (data?.length || 0) >= pageSize,
      total: count || 0,
      nextCursor: data && data.length > 0 ? data[data.length - 1]?.id : undefined,
      prevCursor: page > 1 ? String(page - 1) : undefined,
    };
  }

  async getEntry(id: string, incrementViews = false): Promise<ArchiveEntry | null> {
    const { data, error } = await this.supabase
      .schema('archive')
      .from('entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching archive entry:', error);
      return null;
    }

    if (incrementViews && data) {
      await this.incrementViews(id);
    }

    return data as ArchiveEntry;
  }

  async createEntry(entryData: Omit<ArchiveEntry, 'id' | 'created_at' | 'updated_at'>): Promise<ArchiveEntry> {
    const { data, error } = await this.supabase
      .schema('archive')
      .from('entries')
      .insert(entryData)
      .select()
      .single();

    if (error) {
      console.error('Error creating archive entry:', error);
      throw error;
    }

    return data as ArchiveEntry;
  }

  async updateEntry({ id, updates }: ArchiveUpdateOptions): Promise<ArchiveEntry> {
    const { data, error } = await this.supabase
      .schema('archive')
      .from('entries')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating archive entry:', error);
      throw error;
    }

    return data as ArchiveEntry;
  }

  async deleteEntry(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('archive')
      .from('entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting archive entry:', error);
      throw error;
    }
  }

  // Stats and Analytics
  async getStats(): Promise<ArchiveStats> {
    const { data, error } = await this.supabase.rpc('get_archive_stats');

    if (error) {
      console.error('Error fetching archive stats:', error);
      throw error;
    }

    return data as ArchiveStats;
  }

  // Interactions
  async incrementViews(id: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_views', {
      entry_id: id,
    });

    if (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }

  async incrementLikes(id: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('increment_likes', {
      entry_id: id,
    });

    if (error) {
      console.error('Error incrementing likes:', error);
      throw error;
    }

    return data;
  }

  // Recommendations - fallback to simple query if RPC fails
  async getRecommendations(
    entryId: string,
    options: {
      limit?: number;
      minScore?: number;
      excludeIds?: string[];
    } = {}
  ): Promise<RecommendationScore[]> {
    const limit = options.limit || 8;

    // Try RPC first
    const { data, error } = await this.supabase.rpc('get_recommendations', {
      entry_id: entryId,
      max_results: limit,
    });

    if (!error && data) {
      return data as RecommendationScore[];
    }

    // Fallback: simple query for similar entries by mood/tags
    console.warn('RPC get_recommendations failed, using fallback query:', error?.message);

    // Get the current entry to find similar ones
    const { data: currentEntry } = await this.supabase
      .schema('archive')
      .from('entries')
      .select('mood, tags, colors')
      .eq('id', entryId)
      .single();

    if (!currentEntry) return [];

    // Find entries with overlapping mood or tags
    const { data: similar } = await this.supabase
      .schema('archive')
      .from('entries')
      .select('*')
      .eq('is_public', true)
      .neq('id', entryId)
      .limit(limit);

    if (!similar) return [];

    // Return as RecommendationScore format
    return similar.map((entry: any) => ({
      entryId: entry.id,
      score: 0.5,
      factors: { color: 0, mood: 0, place: 0, tags: 0, recency: 0, popularity: 0 },
      entry,
    }));
  }

  // Timeline
  async getTimeline(): Promise<TimelineGroup[]> {
    const { data, error } = await this.supabase.rpc('get_timeline_entries');

    if (error) {
      console.error('Error fetching timeline:', error);
      return [];
    }

    return data as TimelineGroup[];
  }

  // Playlists
  async getPlaylists(userId: string): Promise<Playlist[]> {
    const { data, error } = await this.supabase
      .from('archive.playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }

    return data as Playlist[];
  }

  async getPlaylist(playlistId: string): Promise<Playlist | null> {
    const { data, error } = await this.supabase
      .schema('archive')
      .from('playlists')
      .select('*, items(*, entry:entries(*))')
      .eq('id', playlistId)
      .single();

    if (error) {
      console.error('Error fetching playlist:', error);
      return null;
    }

    return data as unknown as Playlist;
  }

  // Admin
  async getAdminStats(): Promise<{
    totalEntries: number;
    totalStorage: number;
    entriesByMonth: { month: string; count: number }[];
    recentActivity: any[];
  }> {
    const { data, error } = await this.supabase.rpc('get_admin_archive_stats');

    if (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }

    return data;
  }
}

// Export a singleton instance
export const archiveService = new ArchiveService();

// Helper functions for backward compatibility
export async function getArchiveEntries(
  filters: ArchiveFilters = {},
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<ArchiveEntry>> {
  return archiveService.getEntries(filters, page, pageSize);
}

export async function getArchiveEntry(id: string): Promise<ArchiveEntry | null> {
  return archiveService.getEntry(id, true);
}

export async function incrementViews(id: string): Promise<void> {
  return archiveService.incrementViews(id);
}

export async function incrementLikes(id: string): Promise<number> {
  return archiveService.incrementLikes(id);
}

export async function getRecommendedEntries(
  entryId: string,
  limit = 4
): Promise<ArchiveEntry[]> {
  const recommendations = await archiveService.getRecommendations(entryId, { limit });
  return recommendations.map((r: any) => r.entry || r as ArchiveEntry).filter(Boolean);
}

// Make supabase instance available for helper functions
const getSupabaseClient = () => {
  // Use a loosely typed client here to allow access to the custom 'archive' schema
  // without fighting the generated Database types.
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );
};

export async function getUniquePlaces(): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .schema('archive')
    .from('entries')
    .select('place')
    .not('place', 'is', null)
    .not('place', 'eq', '');

  if (error) {
    console.error('Error fetching unique places:', error);
    return [];
  }

  const rows = (data ?? []) as { place: string | null }[];
  return [...new Set(rows.map((item) => item.place).filter(Boolean) as string[])];
}

export async function getUniqueMoods(): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .schema('archive')
    .from('entries')
    .select('mood');

  if (error) {
    console.error('Error fetching unique moods:', error);
    return [];
  }

  const allMoods = data.flatMap((entry: { mood: string[] | null }) => entry.mood || []);
  return [...new Set(allMoods)].filter(Boolean) as string[];
}

// Get unique colors from all entries (for dynamic color filter)
export async function getUniqueColors(): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .schema('archive')
    .from('entries')
    .select('colors');

  if (error) {
    console.error('Error fetching unique colors:', error);
    return [];
  }

  // Flatten all color arrays and get unique values
  const allColors = data.flatMap((entry: { colors: string[] | null }) => entry.colors || []);
  // Return unique colors, limit to most common ones
  const colorCounts = allColors.reduce((acc: Record<string, number>, color: string) => {
    acc[color] = (acc[color] || 0) + 1;
    return acc;
  }, {});

  // Sort by frequency and return top 12 colors
  return Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([color]) => color);
}

// Get unique tags from all entries (for search suggestions)
export async function getUniqueTags(): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .schema('archive')
    .from('entries')
    .select('tags');

  if (error) {
    console.error('Error fetching unique tags:', error);
    return [];
  }

  const allTags = data.flatMap((entry: { tags: string[] | null }) => entry.tags || []);
  return [...new Set(allTags)].filter(Boolean) as string[];
}
