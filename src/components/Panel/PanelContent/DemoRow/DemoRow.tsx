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

const DemoRow = ({ match }: { match: FaceitMatchStats }) => {
  const [status, setStatus] = useState<AnalyzerDemoStatus | undefined | null>(
    undefined,
  );
  const [analyzerMatchId, setAnalyzerMatchId] = useState<number | undefined>();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { exists, demos } = await fetchAnalyzerGameStatus(match.matchId);
        if (!exists) {
          setStatus(null);
          return;
        }

        const demo = demos[match.matchRound - 1];
        const matchId = await getAnalyzerMatchId(demo.demoId);
        if (!matchId) {
          setStatus(null);
          return;
        }

        setStatus(demo);
        setAnalyzerMatchId(matchId);
      } catch (err) {
        console.error("Error fetching demo status:", err);
      }
    };

    fetchStatus();
  }, [match]);

  const uploadDemo = async () => {
    const faceitMatch = await fetchFaceitMatch(match.matchId);
    const { id: faceitMatchId, demoURLs } = faceitMatch;
    const demoUrl = demoURLs[match.matchRound - 1];
    const { demoId } = await sendDemoToAnalyzer(faceitMatchId, demoUrl);
    console.log(demoId);
  };

  return (
    <TableRow key={`${match.matchId}-${match.matchRound}`}>
      <TableCell>{formatDate(match.date)}</TableCell>
      <TableCell>{match.score}</TableCell>
      <TableCell>
        {status === undefined ? (
          <div className="flex items-center justify-center gap-1">
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Loading...</span>
          </div>
        ) : status === null ? (
          <Button
            variant="outline"
            className="rounded border-brand bg-brand/10 shadow-none hover:bg-brand/30"
            onClick={uploadDemo}
          >
            Upload
          </Button>
        ) : (
          <Button
            asChild
            variant="outline"
            className="rounded border-brand bg-brand/10 shadow-none hover:bg-brand/30"
          >
            <a
              className="flex items-center font-bold"
              href={`https://csanalyzer.gg/app/matches/${analyzerMatchId}`}
            >
              Open
            </a>
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default DemoRow;
