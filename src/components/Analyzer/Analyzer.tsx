import Map from './Map/Map';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FaceitMatch, MapVetoEntity } from '@/api/faceit';
import { AnalyzerDemoState, AnalyzerGameStatus } from '@/api/analyzer';

export interface MapData {
  map: MapVetoEntity;
  demoUrl: string;
  analyzerStatus: AnalyzerDemoState | null;
}

const Analayzer = ({
  matchData,
  analyzerGameStatus,
}: {
  matchData: FaceitMatch;
  analyzerGameStatus: AnalyzerGameStatus;
}) => {
  const { voting, demoURLs: faceitDemoUrls, id: matchId } = matchData;
  if (!voting || !faceitDemoUrls) return null;

  const { map } = voting;
  if (!map) return null;

  const { demos: analyzerDemos } = analyzerGameStatus;
  const { entities, pick } = map;

  const maps: MapData[] = faceitDemoUrls.map((faceitDemoUrl, idx) => {
    const map = entities.find((entity) => entity.className === pick[idx])!;
    const analyzerStatus =
      analyzerDemos.find(
        ({ demoUrl: analyzerDemoUrl }) => faceitDemoUrl === analyzerDemoUrl
      ) ?? null;
    return { map, demoUrl: faceitDemoUrl, analyzerStatus };
  });

  const singleMap = maps.length === 1;

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
          {maps.map((mapData, idx) => (
            <Map
              key={idx}
              matchId={matchId}
              mapData={mapData}
              single={singleMap}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analayzer;
