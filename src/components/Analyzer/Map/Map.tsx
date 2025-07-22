import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getAnalyzerMatchId, sendDemoToAnalyzer } from '@/api/analyzer';
import { MapData } from '../Analyzer';

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
    analyzerStatus?.demoId ?? null
  );
  const [isUploaded, setIsUploaded] = useState<boolean>(
    !!(
      analyzerStatus &&
      !analyzerStatus.quotaExceeded &&
      analyzerStatus.status !== 'waiting'
    )
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!analyzerDemoId) return;

    const pollMatchId = async () => {
      const matchId = await getAnalyzerMatchId(analyzerDemoId);
      if (matchId) {
        clearInterval(intervalId);
        setAnalyzerMatchId(matchId);
        setIsLoading(false);
      }
    };

    pollMatchId();

    const intervalId = setInterval(pollMatchId, 10000);

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
          ? { ...err }
          : { name: 'Error', message: 'Unknown error' }
      );
      console.error('Upload failed:', err);
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
            ? 'Upload to CSAnalyzer.gg'
            : `Upload ${name} to CSAnalyzer.gg`}
        </Button>
        {error && <p>{error.message}</p>}
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
        {single ? 'View on CSAnalyzer.gg' : `View ${name} on CSAnalyzer.gg`}
      </a>
    </Button>
  );
};

export default Map;
