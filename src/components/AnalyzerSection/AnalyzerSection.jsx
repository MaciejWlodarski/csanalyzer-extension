import Maps from "./Maps/Maps";

const AnalyzerSection = ({ matchData, analyzerStatus }) => {
  const { voting, demoURLs, id: matchId } = matchData;
  if (!voting || !demoURLs) return null;

  const { map } = voting;
  if (!map) return null;

  const { demos: analyzerDemos } = analyzerStatus;

  return (
    <div className="dark flex flex-col gap-3 pb-8">
      <Maps
        matchId={matchId}
        map={map}
        demoURLs={demoURLs}
        analyzerDemos={analyzerDemos}
      />
    </div>
  );
};

export default AnalyzerSection;
