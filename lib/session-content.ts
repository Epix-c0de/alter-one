import { supabase } from './supabase';
import { Database } from '@/types/database';

type ContentType = 'reading' | 'song' | 'prayer' | 'announcement';

export interface SessionContent {
    readings: Database['public']['Tables']['readings']['Row'][];
    songs: Database['public']['Tables']['songs']['Row'][];
    prayers: Database['public']['Tables']['prayers']['Row'][];
    // announcements: ... (if table exists, otherwise generic)
}

export const fetchSessionContent = async (sessionId: string): Promise<SessionContent> => {
    const content: SessionContent = {
        readings: [],
        songs: [],
        prayers: [],
    };

    try {
        // 1. Get all mappings for this session
        const { data: mappings, error } = await supabase
            .from('session_content_mappings')
            .select('*')
            .eq('session_id', sessionId);

        if (error) throw error;
        if (!mappings) return content;

        // 2. Fetch content based on type
        // This could be optimized with Promise.all or better SQL joins if polymorphic
        for (const mapping of mappings) {
            switch (mapping.content_type) {
                case 'reading':
                    const { data: reading } = await supabase
                        .from('readings')
                        .select('*')
                        .eq('id', mapping.content_id)
                        .single();
                    if (reading) content.readings.push(reading);
                    break;
                case 'song':
                    const { data: song } = await supabase
                        .from('songs')
                        .select('*')
                        .eq('id', mapping.content_id)
                        .single();
                    if (song) content.songs.push(song);
                    break;
                case 'prayer':
                    const { data: prayer } = await supabase
                        .from('prayers')
                        .select('*')
                        .eq('id', mapping.content_id)
                        .single();
                    if (prayer) content.prayers.push(prayer);
                    break;
            }
        }
    } catch (error) {
        console.error('Error fetching session content:', error);
    }

    return content;
};
