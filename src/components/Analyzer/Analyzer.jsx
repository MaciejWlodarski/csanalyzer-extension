import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Map from "./Map/Map";

const Analayzer = ({ matchData, analyzerStatus }) => {
  const { voting, demoURLs, id: matchId } = matchData;
  if (!voting || !demoURLs) return null;

  const { map } = voting;
  if (!map) return null;

  const { demos: analyzerDemos } = analyzerStatus;
  const { entities, pick } = map;

  const maps = demoURLs.map((demoURL, idx) => {
    const map = entities.find((entity) => entity.class_name === pick[idx]);
    const analyzerStatus =
      analyzerDemos.find(({ demo_url }) => demo_url === demoURL) ?? null;
    return { map, demoURL, analyzerStatus };
  });

  const singleMap = maps.length === 1;

  return (
    <div className="dark flex flex-col pb-8">
      <Card className="overflow-hidden rounded bg-neutral-900">
        <CardHeader className="bg-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <a href="https://csanalyzer.gg/">
              <img
                src={chrome.runtime.getURL("assets/logo.svg")}
                alt="CSAnalyzer.gg"
                className="h-5 w-min"
              />
            </a>
            <span class="text-xs font-bold text-neutral-500">{`v${__APP_VERSION__}`}</span>
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
