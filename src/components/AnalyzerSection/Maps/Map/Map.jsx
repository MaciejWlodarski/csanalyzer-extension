import { useState } from "react";
import Upload from "./Upload/Upload";

const Map = ({ matchId, mapData }) => {
  const { map, demoURL, analyzerStatus } = mapData;
  const { name } = map;

  const [isUploaded, setIsUploaded] = useState(
    !!(analyzerStatus && !analyzerStatus.quota_exceeded),
  );

  const [analyzerId, setAnalyzerId] = useState(analyzerStatus?.demo_id ?? null);

  if (!isUploaded || !analyzerId) {
    return (
      <Upload
        matchId={matchId}
        demoURL={demoURL}
        name={name}
        setIsUploaded={setIsUploaded}
        setAnalyzerId={setAnalyzerId}
      />
    );
  }

  return (
    <a
      href={`https://panel.collector.csanalyzer.gg/demo/${analyzerId}`}
      className="flex items-center justify-center rounded border border-solid border-neutral-700 bg-neutral-950 p-2 text-white no-underline transition-colors hover:bg-neutral-800"
    >
      <span className="flex items-center font-bold">{`View ${name} on CSAnalyzer.gg`}</span>
    </a>
  );
};

export default Map;
