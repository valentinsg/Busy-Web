import {
    ArchiveEntry,
    ArchiveFilters,
    ArchiveStats,
    ArchiveUpdateOptions,
    PaginatedResponse,
    Playlist,
    RecommendationScore,
    TimelineGroup
} from '@/types/files';
import { createClient } from '@supabase/supabase-js';

export class FilesService {
  private supabase = createClient(
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
    pageSize = 20,
    includePrivate = false
  ): Promise<PaginatedResponse<ArchiveEntry>> {
    // Determine sort order - use created_at (the date assigned by user when uploading)
    // This allows sorting by the actual date of the photo, not when it was uploaded
    // newest = descending (most recent first), oldest = ascending (oldest first)
    const ascending = filters.sort === 'oldest';

    let query = this.supabase
      .schema('archive')
      .from('entries')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending, nullsFirst: false })
      .order('id', { ascending }); // Secondary sort for consistency

    // Only filter by is_public if not including private entries (admin mode)
    if (!includePrivate) {
      query = query.eq('is_public', true);
    }

    // Apply filters
    if (filters.color) {
      query = query.contains('colors', [filters.color]);
    }

    // Note: mood filter removed per user request

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
      console.error('Error fetching files entry:', error);
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
      console.error('Error creating files entry:', error);
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
      console.error('Error updating files entry:', error);
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
      console.error('Error deleting files entry:', error);
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

  async decrementLikes(id: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('decrement_likes', {
      entry_id: id,
    });

    if (error) {
      console.error('Error decrementing likes:', error);
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

    // Return as RecommendationScore format (best-effort typing)
    return (similar as unknown as ArchiveEntry[]).map((entry) => ({
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
    recentActivity: unknown[];
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
export const filesService = new FilesService();

// Helper functions for backward compatibility
export async function getFilesEntries(
  filters: ArchiveFilters = {},
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<ArchiveEntry>> {
  return filesService.getEntries(filters, page, pageSize);
}

export async function getFilesEntry(id: string): Promise<ArchiveEntry | null> {
  return filesService.getEntry(id, true);
}

export async function incrementViews(id: string): Promise<void> {
  return filesService.incrementViews(id);
}

export async function incrementLikes(id: string): Promise<number> {
  return filesService.incrementLikes(id);
}

export async function getRecommendedEntries(
  entryId: string,
  limit = 4
): Promise<ArchiveEntry[]> {
  const recommendations = await filesService.getRecommendations(entryId, { limit });
  return recommendations
    .map((r: RecommendationScore & { entry?: ArchiveEntry }) => r.entry ?? (r as unknown as ArchiveEntry))
    .filter(Boolean);
}

// Singleton supabase client for helper functions (avoid creating new clients)
let _helperClient: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
  if (!_helperClient) {
    _helperClient = createClient(
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
  }
  return _helperClient;
};

export async function getUniquePlaces(): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('archive.entries')
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
    .from('archive.entries')
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
    .from('archive.entries')
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
    .from('archive.entries')
    .select('tags');

  if (error) {
    console.error('Error fetching unique tags:', error);
    return [];
  }

  const allTags = data.flatMap((entry: { tags: string[] | null }) => entry.tags || []);
  return [...new Set(allTags)].filter(Boolean) as string[];
}
