import React from "react";
import ReactDOM from "react-dom";
import Analayzer from "./components/Analyzer/Analyzer";
import { observeForGameInfoSection } from "./page/observer";
import { injectScript } from "./utils/scripts";
import { getAnalyzerDemoStatus } from "./api/api";
import "./index.css";

injectScript();

let response;

window.addEventListener("apiResponseIntercepted", async (event) => {
  response = event.detail;
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

const extractMatchIdFromUrl = (url) => {
  const match = url.match(/faceit\.com\/[^/]+\/cs2\/room\/(1-[a-f0-9-]+)/i);
  return match ? match[1] : null;
};

window.addEventListener("urlChange", async (event) => {
  if (!response) return;

  const urlMatchId = extractMatchIdFromUrl(event.detail);
  const apiMatchId = response.id;

  if (urlMatchId !== apiMatchId) {
    document.querySelectorAll("#react-root").forEach((element) => {
      element.remove();
    });
    return;
  }

  document.querySelectorAll("#react-root").forEach((element) => {
    if (element.dataset.matchId !== urlMatchId) {
      element.remove();
    }
  });

  const analyzerStatus = await getAnalyzerDemoStatus(urlMatchId);

  observeForGameInfoSection((rootElement) => {
    ReactDOM.createRoot(rootElement).render(
      <Analayzer matchData={response} analyzerStatus={analyzerStatus} />,
    );
  }, urlMatchId);
});
