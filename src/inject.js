import { interceptMatchApiData } from "./api/apiResponse";

interceptMatchApiData((data) => {
  const eventName = `apiResponseIntercepted`;

  window.dispatchEvent(
    new CustomEvent(eventName, {
      detail: data,
    }),
  );
});
