import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAnalyzerMatchId, sendDemoToAnalyzer } from "@/api/api";

const Map = ({ matchId, mapData, single }) => {
  const { map, demoURL, analyzerStatus } = mapData;
  const { name } = map;

  const [analyzerMatchId, setAnalyzerMatchId] = useState(null);
  const [analyzerDemoId, setAnalyzerDemoId] = useState(
    analyzerStatus?.demo_id ?? null,
  );
  const [isUploaded, setIsUploaded] = useState(
    !!(analyzerStatus && !analyzerStatus.quota_exceeded),
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!analyzerDemoId) return;

    let intervalId;

    const pollMatchId = async () => {
      const matchId = await getAnalyzerMatchId(analyzerDemoId);
      if (matchId) {
        clearInterval(intervalId);
        setAnalyzerMatchId(matchId);
        setIsLoading(false);
      }
    };

    pollMatchId();

    intervalId = setInterval(pollMatchId, 10000);

    return () => clearInterval(intervalId);
  }, [analyzerDemoId]);

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await sendDemoToAnalyzer(matchId, demoURL);

      setAnalyzerDemoId(response.demo_id);
      setIsUploaded(true);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  if (isLoading) {
    return (
      <Button
        variant="outline"
        className="rounded border-brand bg-brand/10 shadow-none hover:bg-brand/30"
        disabled
      >
        <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        <span>Uploading...</span>
      </Button>
    );
  }

  if (!isUploaded || !analyzerDemoId) {
    return (
      <Button
        variant="outline"
        className="rounded border-brand bg-brand/10 shadow-none hover:bg-brand/30"
        onClick={handleClick}
      >
        {single ? "Upload to CSAnalyzer.gg" : `Upload ${name} to CSAnalyzer.gg`}
      </Button>
    );
  }

  const href = analyzerMatchId
    ? `https://csanalyzer.gg/app/matches/${analyzerMatchId}`
    : `https://panel.collector.csanalyzer.gg/demo/${analyzerDemoId}`;

  return (
    <Button
      asChild
      variant="outline"
      className="rounded border-brand bg-brand/10 shadow-none hover:bg-brand/30"
    >
      <a className="flex items-center font-bold" href={href}>
        {single ? "View on CSAnalyzer.gg" : `View ${name} on CSAnalyzer.gg`}
      </a>
    </Button>
  );
};

export default Map;
