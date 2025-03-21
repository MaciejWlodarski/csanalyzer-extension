import React from "react";
import ReactDOM from "react-dom";
import { observeForGameInfoSection } from "./page/observer";
import { injectScript } from "./utils/scripts";
import AnalyzerSection from "./components/AnalyzerSection/AnalyzerSection";
import { getAnalyzerStatus } from "./api/api";
import "./index.css";

injectScript();

window.addEventListener("apiResponseIntercepted", async (event) => {
  document.querySelectorAll("#react-root").forEach((element) => {
    element.remove();
  });

  const response = event.detail;
  const analyzerStatus = await getAnalyzerStatus(response.id);

  console.log(response);

  observeForGameInfoSection((rootElement) => {
    console.log(rootElement);
    ReactDOM.createRoot(rootElement).render(
      <AnalyzerSection matchData={response} analyzerStatus={analyzerStatus} />,
    );
  });
});
