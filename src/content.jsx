import React from "react";
import ReactDOM from "react-dom";
import Analayzer from "./components/Analyzer/Analyzer";
import { observeForGameInfoSection } from "./page/observer";
import { injectScript } from "./utils/scripts";
import { getAnalyzerDemoStatus } from "./api/api";
import "./index.css";

injectScript();

window.addEventListener("apiResponseIntercepted", async (event) => {
  const response = event.detail;
  const matchId = response.id;

  document.querySelectorAll("#react-root").forEach((element) => {
    if (element.dataset.matchId !== matchId) {
      element.remove();
    }
  });

  const analyzerStatus = await getAnalyzerDemoStatus(matchId);

  observeForGameInfoSection((rootElement) => {
    ReactDOM.createRoot(rootElement).render(
      <Analayzer matchData={response} analyzerStatus={analyzerStatus} />,
    );
  }, matchId);
});
