import React from "react";
import ReactDOM from "react-dom";
import { observeForGameInfoSection } from "./page/observer";
import { injectScript } from "./utils/scripts";
import GameSection from "./components/GameSection/GameSection";
import { getAnalyzerStatus, sendDemosToAnalyzer } from "./api/api";
import "./index.css";

injectScript();

window.addEventListener("apiResponseIntercepted-matchData", (event) => {
  document.querySelectorAll("#react-root").forEach((element) => {
    element.remove();
  });

  const response = event.detail;

  (async () => {
    const analyzerStatus = await getAnalyzerStatus(response.id);
    sendDemosToAnalyzer(response.id, response.demoURLs, analyzerStatus);
  })();

  observeForGameInfoSection((rootElement) => {
    ReactDOM.createRoot(rootElement).render(<GameSection data={response} />);
  });
});
