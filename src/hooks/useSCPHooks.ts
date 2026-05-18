import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scpService } from '../services/scpService';
import { SCPEntry } from '../types';

export const useSCPEntries = (filters: any, pageSize: number = 24) => {
  return useInfiniteQuery({
    queryKey: ['scp-entries', filters],
    queryFn: ({ pageParam = 0 }) => scpService.getPaginatedEntries(pageParam as number, pageSize, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((acc, page) => acc + page.data.length, 0);
      return totalLoaded < lastPage.count ? allPages.length : undefined;
    },
  });
};

export const useSCPAllEntries = () => {
  return useQuery({
    queryKey: ['scp-all-entries'],
    queryFn: async () => {
      try {
        const data = await scpService.getAllEntries();
        return data;
      } catch (error) {
        console.error('[HOOKS] useSCPAllEntries failed:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes instead of 30
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useSCPDetail = (designation: string | undefined) => {
  return useQuery({
    queryKey: ['scp-detail', designation],
    queryFn: () => designation ? scpService.getEntryByDesignation(designation) : null,
    enabled: !!designation,
  });
};

export const useRandomSCP = () => {
  return useQuery({
    queryKey: ['scp-random'],
    queryFn: () => scpService.getRandomEntry(),
    staleTime: 0, // Always get a new random one when refetched
  });
};

export const useSCPMutations = () => {
  const queryClient = useQueryClient();

  const upsertMutation = useMutation({
    mutationFn: (entry: Partial<SCPEntry>) => scpService.upsertEntry(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scp-entries'] });
      queryClient.invalidateQueries({ queryKey: ['scp-all-entries'] });
      queryClient.invalidateQueries({ queryKey: ['scp-detail'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => scpService.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scp-entries'] });
      queryClient.invalidateQueries({ queryKey: ['scp-all-entries'] });
    },
  });

  return { upsertMutation, deleteMutation };
};
