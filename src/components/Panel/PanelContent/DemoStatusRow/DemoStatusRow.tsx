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
import { ExternalLink, Loader2Icon, ShieldX, Upload } from "lucide-react";

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
    <TableRow
      key={`${match.matchId}-${match.matchRound}`}
      className="hover:bg-transparent"
    >
      <TableCell>{formatDate(match.date)}</TableCell>
      <TableCell>{match.score}</TableCell>
      <TableCell>
        {isLoading || !demoData ? (
          <Button className="w-full" size="sm" disabled>
            <Loader2Icon className="animate-spin" />
            Loading...
          </Button>
        ) : isError ? (
          <ErrorText message={error.message} />
        ) : demoData.status === "missing" ? (
          <>
            {isUploading ? (
              <Button className="w-full" size="sm" disabled>
                <Loader2Icon className="animate-spin" />
                Uploading...
              </Button>
            ) : (
              <Button className="w-full" size={"sm"} onClick={() => mutate()}>
                <span>Upload</span>
                <Upload />
              </Button>
            )}

            {isUploadError && <ErrorText message={uploadError.message} />}
          </>
        ) : demoData.status === "queued" ? (
          <Button className="w-full" size="sm" disabled>
            <Loader2Icon className="animate-spin" />
            Queued...
          </Button>
        ) : demoData.status === "processing" ? (
          <Button className="w-full" size="sm" disabled>
            <Loader2Icon className="animate-spin" />
            Processing...
          </Button>
        ) : demoData.status === "success" ? (
          <Button
            asChild
            size="sm"
            className="hover:bg-brand-700 w-full bg-brand"
          >
            <a
              href={`http://csanalyzer.gg/app/matches/${demoData.analyzerMatchId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Stats
              <ExternalLink />
            </a>
          </Button>
        ) : demoData.status === "failed" ? (
          <Button className="w-full" size="sm" disabled>
            <ShieldX />
            Failed
          </Button>
        ) : (
          <span>{demoData.status}</span>
        )}
      </TableCell>
    </TableRow>
  );
};

// Komponent błędu
const ErrorText = ({ message }: { message: string }) => (
  <div className="mt-1 text-sm text-red-500">Error: {message}</div>
);

export default DemoStatusRow;
