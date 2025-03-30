import { interceptMatchApiData } from "./api/apiResponse";
import { setupUrlChangeEvent } from "./page/url";

interceptMatchApiData((data) => {
  const eventName = "apiResponseIntercepted";
  window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
});

setupUrlChangeEvent(() => {
  const eventName = "urlChange";
  window.dispatchEvent(new CustomEvent(eventName, { detail: location.href }));
});
