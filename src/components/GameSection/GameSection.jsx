import { useEffect, useState } from "react";
import Locations from "./Location/Locations";
import Maps from "./Map/Maps";

const GameSection = ({ data }) => {
  const [vetoData, setVetoData] = useState();

  useEffect(() => {
    const handleApiResponse = (event) => setVetoData(event.detail);

    window.addEventListener(
      "apiResponseIntercepted-vetoData",
      handleApiResponse,
    );

    return () => {
      window.removeEventListener(
        "apiResponseIntercepted-vetoData",
        handleApiResponse,
      );
    };
  }, []);

  const { voting } = data;
  if (!voting) return null;

  const { location, map } = voting;

  return (
    <div className="dark flex flex-col gap-3 pb-8">
      <Locations location={location} />
      <Maps map={map} />
    </div>
  );
};

export default GameSection;
