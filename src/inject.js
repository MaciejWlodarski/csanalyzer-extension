import { interceptMatchApiData } from "./api/apiResponse";

interceptMatchApiData(({ label, data }) => {
  const eventName = `apiResponseIntercepted-${label}`;

  window.dispatchEvent(
    new CustomEvent(eventName, {
      detail: data,
    }),
  );
});
