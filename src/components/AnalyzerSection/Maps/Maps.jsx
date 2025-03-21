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

  return (
    <Card className="rounded border border-solid border-neutral-800 bg-neutral-900">
      <CardHeader className="justify-start px-4 py-3">
        <span className="flex justify-start font-bold">{"CSAnalyzer"}</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-3 pt-0">
        {maps.map((mapData, idx) => (
          <Map key={idx} matchId={matchId} mapData={mapData} />
        ))}
      </CardContent>
    </Card>
  );
};

export default Maps;
