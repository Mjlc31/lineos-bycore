import { supabase } from '../lib/supabase';
import { CourseTrack, Lesson } from '../types';

export async function fetchAcademyTracks(): Promise<CourseTrack[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('academy_trilhas')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[academyService] fetchAcademyTracks erro:', error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    img: row.image_url,
    duration: row.duration,
    videos: row.total_videos,
    lessons: row.lessons || [],
  }));
}

export async function fetchUserProgress(userId: string): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('academy_progress')
    .select('video_id')
    .eq('user_id', userId);

  if (error) {
    console.error('[academyService] fetchUserProgress erro:', error);
    return [];
  }
  return (data ?? []).map(row => row.video_id);
}

export async function toggleUserProgress(userId: string, videoId: string, isWatched: boolean): Promise<void> {
  if (!supabase) return;

  if (isWatched) {
    await supabase.from('academy_progress').insert({ user_id: userId, video_id: videoId });
  } else {
    await supabase.from('academy_progress').delete().match({ user_id: userId, video_id: videoId });
  }
}

export async function seedAcademyTracksIfEmpty(defaultTracks: CourseTrack[]): Promise<void> {
  if (!supabase) return;
  const tracks = await fetchAcademyTracks();
  if (tracks.length === 0) {
    console.log('[academyService] Semeando Academy Trilhas...');
    for (let i = 0; i < defaultTracks.length; i++) {
      const track = defaultTracks[i];
      await supabase.from('academy_trilhas').insert({
        id: track.id,
        title: track.title,
        image_url: track.img,
        duration: track.duration,
        total_videos: track.videos,
        sort_order: i,
        lessons: track.lessons || [],
      });
    }
  }
}
