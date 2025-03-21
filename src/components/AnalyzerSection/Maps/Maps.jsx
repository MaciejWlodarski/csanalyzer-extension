import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Map from "./Map/Map";

const Maps = ({ matchId, map, demoURLs, analyzerDemos }) => {
  const { entities, pick } = map;

  const maps = demoURLs.map((demoURL, idx) => {
    const map = entities.find((entity) => entity.class_name === pick[idx]);
    const analyzerStatus =
      analyzerDemos.find(({ demo_url }) => demo_url === demoURL) ?? null;
    return { map, demoURL, analyzerStatus };
  });

  const singleMap = maps.length === 1;

  return (
    <Card className="rounded bg-neutral-900">
      <CardHeader className="justify-start px-4 py-5">
        <a href="https://csanalyzer.gg/">
          <img
            src={chrome.runtime.getURL("assets/logo.svg")}
            alt="CSAnalyzer.gg"
            className="h-5 w-min"
          />
        </a>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-3 pt-0">
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
  );
};

export default Maps;
