import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Location from "./Location";

const Locations = ({ location }) => {
  if (!location) return null;

  const { entities, pick } = location;
  const picks = pick.map((picked) =>
    entities.find((entity) => entity.class_name === picked),
  );

  return (
    <Card className="rounded border border-solid border-zinc-800 bg-neutral-900">
      <CardHeader className="justify-start px-4 py-3">
        <span className="flex justify-start font-bold">
          {"Server" + (picks.length > 1 ? "s" : "")}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-3 pt-0">
        {picks.map((pick) => (
          <Location pick={pick} />
        ))}
      </CardContent>
    </Card>
  );
};

export default Locations;
