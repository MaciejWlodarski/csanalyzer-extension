import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "..";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  AnalyzerDemoStatus,
  fetchAnalyzerGameStatus,
  getAnalyzerMatchId,
  sendDemoToAnalyzer,
} from "@/api/analyzer";
import { FaceitMatchStats, fetchFaceitMatch } from "@/api/faceit";
import { Button } from "@/components/ui/button";

type DemoStatus = AnalyzerDemoStatus | "missing" | "uploading";
type AnalyzerStatusResult =
  | { status: "success"; analyzerMatchId: number }
  | { status: Exclude<DemoStatus, "success"> };

const DemoStatusRow = ({ match }: { match: FaceitMatchStats }) => {
  const queryClient = useQueryClient();
  const statusQueryKey = ["analyzer-status", match.matchId, match.matchRound];

  const {
    data: demoData,
    isLoading,
    isError,
    error,
  } = useQuery<AnalyzerStatusResult, Error>({
    queryKey: statusQueryKey,
    queryFn: async () => {
      const { exists, demos } = await fetchAnalyzerGameStatus(match.matchId);
      if (!exists) return { status: "missing" };

      const demo = demos[match.matchRound - 1];

      if (demo.status === "success") {
        const matchId = await getAnalyzerMatchId(demo.demoId);

        if (matchId == null) {
          throw new Error(
            "Expected analyzerMatchId for 'success' demo, but got null",
          );
        }

        return {
          status: "success",
          analyzerMatchId: matchId,
        };
      }

      return { status: demo.status };
    },
    refetchInterval: (query) =>
      query.state.data?.status === "queued" ||
      query.state.data?.status === "processing"
        ? 5000
        : false,
  });

  const {
    mutate,
    isPending: isUploading,
    isError: isUploadError,
    error: uploadError,
  } = useMutation({
    mutationFn: async () => {
      const faceitMatch = await fetchFaceitMatch(match.matchId);
      const { id: faceitMatchId, demoURLs } = faceitMatch;
      const demoUrl = demoURLs[match.matchRound - 1];
      await sendDemoToAnalyzer(faceitMatchId, demoUrl);
    },
    onSuccess: () => {
      queryClient.setQueryData<AnalyzerStatusResult>(statusQueryKey, {
        status: "queued",
      });
      queryClient.invalidateQueries({ queryKey: statusQueryKey });
    },
  });

  return (
    <TableRow key={`${match.matchId}-${match.matchRound}`}>
      <TableCell>{formatDate(match.date)}</TableCell>
      <TableCell>{match.score}</TableCell>
      <TableCell>
        {isLoading || !demoData ? (
          <SpinnerText text="Loading..." />
        ) : isError ? (
          <ErrorText message={error.message} />
        ) : demoData.status === "missing" ? (
          <>
            <Button
              variant="outline"
              className="rounded border-brand bg-brand/10 shadow-none hover:bg-brand/30"
              onClick={() => mutate()}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
            {isUploadError && <ErrorText message={uploadError.message} />}
          </>
        ) : demoData.status === "queued" ? (
          <SpinnerText text="Queued..." />
        ) : demoData.status === "processing" ? (
          <SpinnerText text="Processing..." />
        ) : demoData.status === "success" ? (
          <span>✔ Ready</span>
        ) : demoData.status === "failed" ? (
          <span>❌ Failed</span>
        ) : (
          <span>{demoData.status}</span>
        )}
      </TableCell>
    </TableRow>
  );
};

// Spinner z tekstem
const SpinnerText = ({ text }: { text: string }) => (
  <div className="flex items-center justify-center gap-1">
    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
    <span>{text}</span>
  </div>
);

// Komponent błędu
const ErrorText = ({ message }: { message: string }) => (
  <div className="mt-1 text-sm text-red-500">Error: {message}</div>
);

export default DemoStatusRow;
