import { useEffect, useState } from "react";
import { formatDate } from "..";
import { TableCell, TableRow } from "@/components/ui/table";
import { getAnalyzerDemoStatus } from "@/api/api";

const DemoRow = ({ match }) => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { exists, demos } = await getAnalyzerDemoStatus(match.matchId);
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
      <TableCell>{match.i18}</TableCell>
      <TableCell>{status?.status}</TableCell>
    </TableRow>
  );
};

export default DemoRow;
