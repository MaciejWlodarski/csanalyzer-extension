import { interceptApiData } from "./api/apiResponse";
import { setupUrlChangeEvent } from "./page/url";

interceptApiData(({ label, payload }) => {
  if (label === "match") {
    window.dispatchEvent(new CustomEvent("matchApi", { detail: payload }));
  } else if (label === "stats") {
    window.dispatchEvent(new CustomEvent("statsApi", { detail: payload }));
  }
});

setupUrlChangeEvent(() => {
  window.dispatchEvent(new CustomEvent("urlChange", { detail: location.href }));
});
