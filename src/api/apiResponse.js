export const interceptMatchApiData = (callback) => {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._interceptedUrl = url;
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    this.addEventListener("readystatechange", function () {
      if (
        this.readyState === 4 &&
        this.status === 200 &&
        this._interceptedUrl.includes("/api/match/v2/match/")
      ) {
        try {
          const response = JSON.parse(this.responseText);
          const payload = response?.payload;

          if (payload) {
            callback(payload);
          }
        } catch (error) {
          console.error("Error parsing response:", error);
        }
      }
    });

    return originalSend.apply(this, arguments);
  };
};
