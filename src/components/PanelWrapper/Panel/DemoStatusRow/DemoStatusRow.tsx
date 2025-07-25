import { formatDate } from '..';
import { TableCell, TableRow } from '@/components/ui/table';
import { FaceitMatchStats } from '@/api/faceit';
import { Button } from '@/components/ui/button';
import { ExternalLink, LoaderCircle, ShieldX, Upload } from 'lucide-react';
import { useAnalyzerStatus } from '@/hooks/useAnalyzerStatus';

const DemoStatusRow = ({ match }: { match: FaceitMatchStats }) => {
  const { statusQuery, uploadMutation } = useAnalyzerStatus(match);
  const { data: demoData, isLoading, isError, error } = statusQuery;
  const {
    mutate,
    isPending: isUploading,
    isError: isUploadError,
    error: uploadError,
  } = uploadMutation;

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
            <LoaderCircle className="animate-spin" />
            Loading...
          </Button>
        ) : isError ? (
          <div className="mt-1 text-sm text-red-500">{error.message}</div>
        ) : demoData.status === 'missing' ? (
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
              href={`http://csanalyzer.gg/app/matches/${demoData.analyzerMatchId}`}
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
      </TableCell>
    </TableRow>
  );
};

export default DemoStatusRow;
