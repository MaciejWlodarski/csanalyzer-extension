import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FaceitMatch, MapVetoEntity } from '@/api/faceit';
import { useQuery } from '@tanstack/react-query';
import { AnalyzerDemoState, fetchAnalyzerGameStatus } from '@/api/analyzer';
import DemoButton from './DemoButton/DemoButton';

export interface MapData {
  map: MapVetoEntity;
  demoUrl: string;
}

export const getMaps = (match: FaceitMatch) => {
  const veto = match.voting?.map;
  if (veto) {
    return veto.pick.map((pick) => {
      const m = veto.entities.find((m) => m.className === pick);
      if (!m) throw new Error(`No entity for pick: ${pick}`);
      return m;
    });
  }

  const maps = match.matchCustom.tree.map.values.value;
  if (Array.isArray(maps)) {
    return maps;
  }

  return maps ? [maps] : [];
};

const MatchPageWidget = ({ matchData }: { matchData: FaceitMatch }) => {
  const { demoURLs: faceitDemoUrls, id: matchId } = matchData;
  if (!faceitDemoUrls) return null;

  const {
    data: demoStates,
    isFetching: isLoadingDemos,
    isError: isDemosError,
    error: demosError,
  } = useQuery<Map<string, AnalyzerDemoState | undefined>>({
    queryKey: ['match-page-analyzer-statuses', matchData.id],
    queryFn: async () => {
      const gameStatus = await fetchAnalyzerGameStatus(matchData.id);

      return new Map(
        faceitDemoUrls.map<[string, AnalyzerDemoState | undefined]>(
          (demoUrl) => {
            if (!gameStatus.exists) return [demoUrl, undefined];

            const found = gameStatus.demos.find((s) => s.demoUrl === demoUrl);
            return [demoUrl, found];
          }
        )
      );
    },
    enabled: faceitDemoUrls.length > 0,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="flex flex-col pb-8">
      <Card className="overflow-hidden rounded bg-neutral-900">
        <CardHeader className="bg-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <a href="https://csanalyzer.gg/">
              <img
                src={chrome.runtime.getURL('assets/logo.svg')}
                alt="CSAnalyzer.gg"
                className="h-5 w-min"
              />
            </a>
            <span className="text-xs font-bold text-neutral-500">
              v{__APP_VERSION__}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-3">
          {isDemosError && (
            <div className="text-sm text-red-500">
              Error loading demo states: {demosError.message}
            </div>
          )}

          {faceitDemoUrls.length === 0 && (
            <div className="text-sm text-neutral-400">
              Demos are not yet available for this match.
            </div>
          )}

          {!isDemosError &&
            faceitDemoUrls.length > 0 &&
            faceitDemoUrls.map((demoUrl, idx) => {
              const demo = demoStates?.get(demoUrl);
              return (
                <DemoButton
                  key={demoUrl}
                  matchId={matchId}
                  demoUrl={demoUrl}
                  demoIdx={idx}
                  demo={demo}
                  isBatchLoading={isLoadingDemos}
                />
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchPageWidget;
