import { Button } from '@/components/ui/button';
import { AnalyzerDemoState } from '@/api/analyzer';
import { ExternalLink, LoaderCircle, ShieldX, Upload } from 'lucide-react';
import { useAnalyzerStatus } from '@/hooks/useAnalyzerStatus';

const Demo = ({
  matchId,
  demoUrl,
  demoIdx,
  demo,
  isBatchLoading,
}: {
  matchId: string;
  demoUrl: string;
  demoIdx: number;
  demo?: AnalyzerDemoState;
  isBatchLoading: boolean;
}) => {
  const { statusQuery, uploadMutation } = useAnalyzerStatus(
    matchId,
    demoIdx,
    demo,
    demoUrl
  );
  const { data: demoData, isLoading, isError, error } = statusQuery;
  const {
    mutate,
    isPending: isUploading,
    isError: isUploadError,
    error: uploadError,
  } = uploadMutation;

  return (
    <>
      {isBatchLoading || isLoading || !demoData ? (
        <Button className="w-full" size="sm" disabled>
          <LoaderCircle className="animate-spin" />
          Loading...
        </Button>
      ) : isError ? (
        <div className="mt-1 text-sm text-red-500">{error.message}</div>
      ) : demoData.status === 'missing' || demoData.status === 'waiting' ? (
        <>
          {isUploading ? (
            <Button className="w-full" size="sm" disabled>
              <LoaderCircle className="animate-spin" />
              Uploading...
            </Button>
          ) : (
            <Button className="w-full" size="sm" onClick={() => mutate()}>
              <span>Upload</span>
              <Upload />
            </Button>
          )}

          {isUploadError && (
            <div className="mt-1 text-sm text-red-500">
              {uploadError.message}
            </div>
          )}
        </>
      ) : demoData.status === 'queued' ? (
        <Button className="w-full" size="sm" disabled>
          <LoaderCircle className="animate-spin" />
          Queued...
        </Button>
      ) : demoData.status === 'processing' ? (
        <Button className="w-full" size="sm" disabled>
          <LoaderCircle className="animate-spin" />
          Processing...
        </Button>
      ) : demoData.status === 'success' ? (
        <Button
          asChild
          size="sm"
          className="w-full bg-brand hover:bg-brand-700"
        >
          <a
            href={`http://csanalyzer.gg/app/matches/${demoData.demoId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Stats
            <ExternalLink />
          </a>
        </Button>
      ) : demoData.status === 'failed' ? (
        <Button
          disabled
          size="sm"
          className="w-full bg-red-700 text-white disabled:opacity-100"
        >
          Failed
          <ShieldX />
        </Button>
      ) : (
        <span>{demoData.status}</span>
      )}
    </>
  );
};

export default Demo;
