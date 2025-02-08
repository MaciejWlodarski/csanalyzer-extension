export const interceptMatchApiData = (callback) => {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (
    method,
    url,
    async,
    user,
    password,
  ) {
    this._interceptedUrl = url;
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    this.addEventListener("readystatechange", function () {
      if (this.readyState === 4 && this.status === 200) {
        let label = null;

        if (this._interceptedUrl.includes("/api/match/v2/match/")) {
          label = "matchData";
        } else if (this._interceptedUrl.includes("/api/democracy/v1/match")) {
          label = "vetoData";
        }

        if (label) {
          try {
            const response = JSON.parse(this.responseText);
            const payload = response?.payload;

            if (payload) {
              callback({ label, data: payload });
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
