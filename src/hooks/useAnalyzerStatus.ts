import {
  AnalyzerDemoStatus,
  fetchAnalyzerGameStatus,
  getAnalyzerMatchId,
  sendDemoToAnalyzer,
} from '@/api/analyzer';
import { fetchFaceitMatch, HttpError } from '@/api/faceit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type DemoStatus = AnalyzerDemoStatus | 'missing' | 'uploading';
type AnalyzerStatusResult =
  | { status: 'success'; analyzerMatchId: number }
  | { status: Exclude<DemoStatus, 'success'> };

export function useAnalyzerStatus(match: {
  matchId: string;
  matchRound: number;
}) {
  const queryClient = useQueryClient();
  const statusQueryKey = ['analyzer-status', match.matchId, match.matchRound];

  const statusQuery = useQuery<AnalyzerStatusResult, Error>({
    queryKey: statusQueryKey,
    queryFn: async () => {
      const { exists, demos } = await fetchAnalyzerGameStatus(match.matchId);
      if (!exists) return { status: 'missing' };

      const demo = demos[match.matchRound - 1];
      if (demo.quotaExceeded) return { status: 'missing' };

      if (demo.status === 'success') {
        const matchId = await getAnalyzerMatchId(demo.demoId);
        if (matchId === null) {
          throw new Error(
            "Expected analyzerMatchId for 'success' demo, but got null"
          );
        }
        return { status: 'success', analyzerMatchId: matchId };
      }

      return { status: demo.status };
    },
    refetchInterval: (query) =>
      query.state.data?.status === 'queued' ||
      query.state.data?.status === 'processing'
        ? 5000
        : false,
    refetchOnWindowFocus: false,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const faceitMatch = await fetchFaceitMatch(match.matchId);
      const { id: faceitMatchId, demoURLs } = faceitMatch;

      if (!demoURLs) throw new Error('No demo URLs found');
      const demoUrl = demoURLs[match.matchRound - 1];

      try {
        await sendDemoToAnalyzer(faceitMatchId, demoUrl);
      } catch (error) {
        if (error instanceof HttpError && error.status === 403) {
          console.warn('Cookie expired — refreshing session and retrying');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData<AnalyzerStatusResult>(statusQueryKey, {
        status: 'queued',
      });
      queryClient
        .invalidateQueries({ queryKey: statusQueryKey })
        .catch(console.error);
    },
  });

  return {
    statusQuery,
    uploadMutation,
  };
}
