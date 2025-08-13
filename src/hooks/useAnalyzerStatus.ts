import {
  AnalyzerDemoState,
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

export function useAnalyzerStatus(
  matchId: string,
  demoIdx: number,
  demo?: AnalyzerDemoState,
  demoUrl?: string
) {
  const queryClient = useQueryClient();
  const statusQueryKey = [
    'analyzer-status',
    matchId,
    demoIdx,
    !!demo,
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
    if (demoState.quotaExceeded) return { status: 'missing' };
    return { status: demoState.status };
  };

  const statusQuery = useQuery<AnalyzerStatusResult, Error>({
    queryKey: statusQueryKey,
    queryFn: async () => {
      if (demo?.quotaExceeded) return { status: 'missing' };
      if (demo?.status === 'failed') return { status: 'failed' };
      if (demo?.status === 'success') return getStatusFromDemo(demo);

      const { exists, demos } = await fetchAnalyzerGameStatus(matchId);
      if (!exists) return { status: 'missing' };
      const fetched = demoUrl
        ? demos.find((d) => d.demoUrl === demoUrl)
        : demos[demoIdx];
      if (!fetched || fetched.quotaExceeded) return { status: 'missing' };
      return getStatusFromDemo(fetched);
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
      let url = demoUrl;
      if (!url) {
        const faceitMatch = await fetchFaceitMatch(matchId);
        const { demoURLs } = faceitMatch;

        if (!demoURLs) throw new Error('No demo URLs found');
        url = demoURLs[demoIdx];
      }

      try {
        await sendDemoToAnalyzer(matchId, url);
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
