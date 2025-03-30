export const setupUrlChangeEvent = (callback) => {
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  let lastUrl = location.href;

  const checkUrlChange = () => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      callback();
    }
  };

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    checkUrlChange();
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    checkUrlChange();
  };

  window.addEventListener("popstate", checkUrlChange);

  callback();

  return () => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    window.removeEventListener("popstate", checkUrlChange);
  };
};
