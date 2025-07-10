import Analayzer from "./components/Analyzer/Analyzer";
import SidebarTrigger from "./components/Panel/SidebarTrigger";
import TopbarTrigger from "./components/Panel/TopbarTrigger";
import { createRoot } from "react-dom/client";
import { observeForGameInfoSection } from "./page/matchObserver";
import { observeForPanelSection } from "./page/panelObserver";
import { injectScript } from "./utils/scripts";
import { getAnalyzerDemoStatus } from "./api/api";
import "./index.css";

injectScript();

let matchApiResponse;

window.addEventListener("matchApi", async (event) => {
  matchApiResponse = event.detail;
  const matchId = matchApiResponse.id;

  document.querySelectorAll("#react-root-match").forEach((element) => {
    if (element.dataset.matchId !== matchId) {
      element.remove();
    }
  });

  const analyzerStatus = await getAnalyzerDemoStatus(matchId);

  observeForGameInfoSection((rootElement) => {
    createRoot(rootElement).render(
      <Analayzer
        matchData={matchApiResponse}
        analyzerStatus={analyzerStatus}
      />,
    );
  }, matchId);
});

const extractMatchIdFromUrl = (url) => {
  const match = url.match(/faceit\.com\/[^/]+\/cs2\/room\/(1-[a-f0-9-]+)/i);
  return match ? match[1] : null;
};

window.addEventListener("urlChange", async (event) => {
  if (!matchApiResponse) return;

  const urlMatchId = extractMatchIdFromUrl(event.detail);
  const apiMatchId = matchApiResponse.id;

  if (urlMatchId !== apiMatchId) {
    document.querySelectorAll("#react-root-match").forEach((element) => {
      element.remove();
    });
    return;
  }

  document.querySelectorAll("#react-root-match").forEach((element) => {
    if (element.dataset.matchId !== urlMatchId) {
      element.remove();
    }
  });

  const analyzerStatus = await getAnalyzerDemoStatus(urlMatchId);

  observeForGameInfoSection((rootElement) => {
    createRoot(rootElement).render(
      <Analayzer
        matchData={matchApiResponse}
        analyzerStatus={analyzerStatus}
      />,
    );
  }, urlMatchId);
});

observeForPanelSection(({ root, pos }) => {
  createRoot(root).render(
    pos == "side" ? <SidebarTrigger /> : <TopbarTrigger />,
  );
});

window.addEventListener("statsApi", async (event) => {
  console.log(event.detail);
});
