export const interceptApiData = (callback) => {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._interceptedUrl = url;
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    this.addEventListener("readystatechange", function () {
      if (this.readyState === 4 && this.status === 200) {
        const url = this._interceptedUrl;

        const isMatchEndpoint = url.includes("/api/match/v2/match/");
        const isStatsGamesEndpoint =
          /\/api\/stats\/v1\/stats\/time\/users\/[^/]+\/games\/cs2(?:\?.*)?$/.test(
            url,
          );

        let label = null;
        if (isMatchEndpoint) label = "match";
        else if (isStatsGamesEndpoint) label = "stats";

        if (label) {
          try {
            const response = JSON.parse(this.responseText);
            const payload = label === "match" ? response?.payload : response;

            if (payload) {
              callback({ label, payload });
            }
          } catch (error) {
            console.error("Error parsing response:", error);
          }
        }
      }
    });

    return originalSend.apply(this, arguments);
  };
};
