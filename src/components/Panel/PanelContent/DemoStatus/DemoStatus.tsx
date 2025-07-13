import { useEffect, useState } from "react";
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

type StatusState = AnalyzerDemoStatus | "missing" | undefined;

const DemoStatus = ({ match }: { match: FaceitMatchStats }) => {
  const [status, setStatus] = useState<StatusState>(undefined);
  const [analyzerMatchId, setAnalyzerMatchId] = useState<number | undefined>();

  const [uploading, setUploading] = useState(false);
  const [inQueue, setInQueue] = useState(false);

  const checkAnalyzerStatus = async () => {
    try {
      const { exists, demos } = await fetchAnalyzerGameStatus(match.matchId);
      if (!exists) {
        setStatus("missing");
        return true;
      }

      const demo = demos[match.matchRound - 1];
      setStatus(demo);

      if (demo.status === "success") {
        const matchId = await getAnalyzerMatchId(demo.demoId);
        if (!matchId) {
          throw new Error("Expected matchId for successful demo, but got null");
        }
        setAnalyzerMatchId(matchId);
        return true;
      }

      if (demo.status === "failed") {
        return true;
      }

      return false;
    } catch (err) {
      console.error("Error checking analyzer status:", err);
      return true;
    }
  };

  useEffect(() => {
    checkAnalyzerStatus();
  }, [match]);

  const uploadDemo = async () => {
    setUploading(true);

    const faceitMatch = await fetchFaceitMatch(match.matchId);
    const { id: faceitMatchId, demoURLs } = faceitMatch;
    const demoUrl = demoURLs[match.matchRound - 1];
    const { demoId } = await sendDemoToAnalyzer(faceitMatchId, demoUrl);

    console.log("Uploaded demoId:", demoId);
    setUploading(false);
    setInQueue(true);

    const interval = setInterval(async () => {
      const shouldStop = await checkAnalyzerStatus();
      setInQueue(false);
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 5000);
  };

  return (
    <TableRow key={`${match.matchId}-${match.matchRound}`}>
      <TableCell>{formatDate(match.date)}</TableCell>
      <TableCell>{match.score}</TableCell>
      <TableCell>
        {uploading ? (
          <div className="flex items-center justify-center gap-1">
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Uploading...</span>
          </div>
        ) : inQueue ? (
          <div className="flex items-center justify-center gap-1">
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>In Queue...</span>
          </div>
        ) : status === undefined ? (
          <div className="flex items-center justify-center gap-1">
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Loading...</span>
          </div>
        ) : status === "missing" ? (
          <Button
            variant="outline"
            className="rounded border-brand bg-brand/10 shadow-none hover:bg-brand/30"
            onClick={uploadDemo}
          >
            Upload
          </Button>
        ) : (
          <span>{status.status}</span>
        )}
      </TableCell>
    </TableRow>
  );
};

export default DemoStatus;
