import { useEffect, useState } from "react";
import { formatDate } from "..";
import { TableCell, TableRow } from "@/components/ui/table";
import { AnalyzerDemoStatus, getAnalyzerGameStatus } from "@/api/analyzer";
import { FaceitMatchStats } from "@/api/faceit";

const DemoRow = ({ match }: { match: FaceitMatchStats }) => {
  const [status, setStatus] = useState<AnalyzerDemoStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { exists, demos } = await getAnalyzerGameStatus(match.matchId);
        if (!exists) return;
        const demo = demos[Number(match.matchRound) - 1];
        setStatus(demo);
      } catch (err) {
        console.error("Error fetching demo status:", err);
      }
    };

    fetchStatus();
  }, [match]);

  return (
    <TableRow key={`${match.matchId}-${match.matchRound}`}>
      <TableCell>{formatDate(match.date)}</TableCell>
      <TableCell>{match.score}</TableCell>
      <TableCell>{status?.status}</TableCell>
    </TableRow>
  );
};

export default DemoRow;
