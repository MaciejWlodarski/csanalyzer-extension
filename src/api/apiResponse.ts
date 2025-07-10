import { faceitMatchSchema, type FaceitMatch } from "./faceitMatch";
import { faceitMatchStatsSchema, type FaceitMatchStats } from "./faceitStats";

type InterceptedPayload =
  | {
      label: "match";
      payload: FaceitMatch;
    }
  | {
      label: "stats";
      payload: FaceitMatchStats[];
    };

export const interceptApiData = (
  callback: (data: InterceptedPayload) => void,
): void => {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method: string, url: string) {
    (this as any)._interceptedUrl = url;
    return originalOpen.apply(this, arguments as any);
  };

  XMLHttpRequest.prototype.send = function () {
    this.addEventListener("readystatechange", function () {
      if (this.readyState === 4 && this.status === 200) {
        const url: string = (this as any)._interceptedUrl;

        const isMatchEndpoint = url.includes("/api/match/v2/match/");
        const isStatsGamesEndpoint =
          /\/api\/stats\/v1\/stats\/time\/users\/[^/]+\/games\/cs2(?:\?.*)?$/.test(
            url,
          );

        if (isMatchEndpoint || isStatsGamesEndpoint) {
          try {
            const response = JSON.parse(this.responseText);

            if (isMatchEndpoint && response?.payload) {
              console.log(response.payload);
              const parsed = faceitMatchSchema.parse(response.payload);
              console.log(parsed);
              callback({ label: "match", payload: parsed });
            } else if (isStatsGamesEndpoint) {
              const parsed = faceitMatchStatsSchema.array().parse(response);
              callback({ label: "stats", payload: parsed });
            }
          } catch (error) {
            console.error("Zod parsing or JSON error:", error);
          }
        }
      }
    });

    return originalSend.apply(this, arguments as any);
  };
};
