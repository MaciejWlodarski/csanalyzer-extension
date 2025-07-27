import {
  AnalyzerDemoState,
  AnalyzerDemoStatus,
  fetchAnalyzerGameStatus,
  getAnalyzerMatchId,
  sendDemoToAnalyzer,
} from '@/api/analyzer';
import { FaceitMatchStats, fetchFaceitMatch, HttpError } from '@/api/faceit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type DemoStatus = AnalyzerDemoStatus | 'missing' | 'uploading';
type AnalyzerStatusResult =
  | { status: 'success'; analyzerMatchId: number }
  | { status: Exclude<DemoStatus, 'success'> };

export function useAnalyzerStatus(
  match: FaceitMatchStats,
  demo?: AnalyzerDemoState
) {
  const queryClient = useQueryClient();
  const statusQueryKey = [
    'analyzer-status',
    match.matchId,
    match.matchRound,
    demo?.demoId,
  ];

  const getStatusFromDemo = async (
    demoState: AnalyzerDemoState
  ): Promise<AnalyzerStatusResult> => {
    if (demoState.status === 'success') {
      const analyzerMatchId = await getAnalyzerMatchId(demoState.demoId);
      if (analyzerMatchId == null) {
        throw new Error(
          "Expected analyzerMatchId for 'success' demo, but got null"
        );
      }
      return { status: 'success', analyzerMatchId };
    }
    return { status: demoState.status };
  };

  const statusQuery = useQuery<AnalyzerStatusResult, Error>({
    queryKey: statusQueryKey,
    queryFn: async () => {
      if (demo) return getStatusFromDemo(demo);

      const { exists, demos } = await fetchAnalyzerGameStatus(match.matchId);
      if (!exists) return { status: 'missing' };

      const fetchedDemo = demos[match.matchRound - 1];
      if (fetchedDemo.quotaExceeded) return { status: 'missing' };

      return getStatusFromDemo(fetchedDemo);
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
