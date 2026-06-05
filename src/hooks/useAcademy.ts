import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAcademyTracks, fetchUserProgress, toggleUserProgress, seedAcademyTracksIfEmpty } from '../services/academyService';
import { CourseTrack } from '../types';
import { academyTracks as initialTracks } from '../data';

export function useAcademy(userId?: string) {
  const queryClient = useQueryClient();

  const { data: academyTracks = [], isLoading: isTracksLoading } = useQuery({
    queryKey: ['academy_tracks'],
    queryFn: async () => {
      await seedAcademyTracksIfEmpty(initialTracks);
      return fetchAcademyTracks();
    },
  });

  const { data: watchedVideos = [], isLoading: isProgressLoading } = useQuery({
    queryKey: ['academy_progress', userId],
    queryFn: async () => {
      if (!userId) return [];
      return fetchUserProgress(userId);
    },
    enabled: !!userId,
  });

  const setWatchedVideos = useCallback((updater: any) => {
    queryClient.setQueryData(['academy_progress', userId], (prev: any) => {
      const current = prev || [];
      return typeof updater === 'function' ? updater(current) : updater;
    });
  }, [queryClient, userId]);

  const toggleVideoWatched = useCallback(async (videoId: string) => {
    if (!userId) return;
    let wasWatched = false;
    setWatchedVideos((prev: string[]) => {
      wasWatched = prev.includes(videoId);
      return wasWatched ? prev.filter(v => v !== videoId) : [...prev, videoId];
    });

    try {
      await toggleUserProgress(userId, videoId, !wasWatched);
    } catch (err) {
      console.error('[useAcademy] erro ao salvar progresso', err);
      // rollback
      setWatchedVideos((prev: string[]) => {
        return wasWatched ? [...prev, videoId] : prev.filter(v => v !== videoId);
      });
    }
  }, [userId, setWatchedVideos]);

  return {
    academyTracks,
    watchedVideos,
    setWatchedVideos,
    toggleVideoWatched,
    isLoading: isTracksLoading || isProgressLoading,
  };
}
