import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CustomError,
  getAnalyzerMatchId,
  sendDemoToAnalyzer,
} from "@/api/analyzer";
import { MapData } from "../Analyzer";

const Map = ({
  matchId,
  mapData,
  single,
}: {
  matchId: string;
  mapData: MapData;
  single: boolean;
}) => {
  const { map, demoUrl, analyzerStatus } = mapData;
  const { name } = map;

  const [analyzerMatchId, setAnalyzerMatchId] = useState<number | null>(null);
  const [analyzerDemoId, setAnalyzerDemoId] = useState<string | null>(
    analyzerStatus?.demoId ?? null,
  );
  const [isUploaded, setIsUploaded] = useState<boolean>(
    !!(
      analyzerStatus &&
      !analyzerStatus.quotaExceeded &&
      analyzerStatus.status !== "waiting"
    ),
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<CustomError | null>(null);

  useEffect(() => {
    if (!analyzerDemoId) return;

    let intervalId: ReturnType<typeof setInterval>;

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
    setError(null);
    try {
      const response = await sendDemoToAnalyzer(matchId, demoUrl);

      setAnalyzerDemoId(response.demoId);
      setIsUploaded(true);
    } catch (err) {
      setIsLoading(false);
      setError(
        err instanceof Error
          ? { ...err, code: 0 }
          : { name: "Error", message: "Unknown error", code: 0 },
      );
      console.error("Upload failed:", err);
    }
  };

  const getErrorLabel = (code: number): ReactNode => {
    switch (code) {
      case 403:
        return (
          <>
            Access denied to demo file (403).
            <br />
            Try downloading any demo manually to generate the necessary cookie.
          </>
        );
      case 404:
        return "Demo file not found (404)";
      case 429:
        return "API rate limit exceeded (429)";
      case 500:
        return "Server error (500)";
      case 0:
        return "No internet connection (0)";
      default:
        return `Unknown error (code: ${code})`;
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
        {isUploaded ? <span>Analyzing...</span> : <span>Uploading...</span>}
      </Button>
    );
  }

  if (!isUploaded || !analyzerDemoId) {
    return (
      <>
        <Button
          variant="outline"
          className="rounded border-brand bg-brand/10 shadow-none hover:bg-brand/30"
          onClick={handleClick}
        >
          {single
            ? "Upload to CSAnalyzer.gg"
            : `Upload ${name} to CSAnalyzer.gg`}
        </Button>
        {error && <p>{getErrorLabel(error.code)}</p>}
      </>
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
