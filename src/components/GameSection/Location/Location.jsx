import { Card, CardContent } from "@/components/ui/card";

const Location = ({ pick }) => {
  const { image_lg, name } = pick;

  return (
    <Card className="rounded border border-solid border-zinc-800">
      <CardContent className="flex items-center gap-2 p-2">
        <img src={image_lg} alt={name} className="w-14 rounded" />
        <span className="flex items-center font-bold">{name}</span>
      </CardContent>
    </Card>
  );
};

export default Location;
