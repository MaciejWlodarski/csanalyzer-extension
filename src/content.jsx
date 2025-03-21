import React from "react";
import ReactDOM from "react-dom";
import { observeForGameInfoSection } from "./page/observer";
import { injectScript } from "./utils/scripts";
import AnalyzerSection from "./components/AnalyzerSection/AnalyzerSection";
import { getAnalyzerDemoStatus } from "./api/api";
import "./index.css";

injectScript();

window.addEventListener("apiResponseIntercepted", async (event) => {
  document.querySelectorAll("#react-root").forEach((element) => {
    element.remove();
  });

  const response = event.detail;
  const analyzerStatus = await getAnalyzerDemoStatus(response.id);

  observeForGameInfoSection((rootElement) => {
    ReactDOM.createRoot(rootElement).render(
      <AnalyzerSection matchData={response} analyzerStatus={analyzerStatus} />,
    );
  });
});
