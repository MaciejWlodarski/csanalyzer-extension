export const setupUrlChangeEvent = (callback: () => void) => {
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);
  let lastUrl = location.href;

  const checkUrlChange = () => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      callback();
    }
  };

  history.pushState = function (...args) {
    originalPushState(...args);
    checkUrlChange();
  };

  history.replaceState = function (...args) {
    originalReplaceState(...args);
    checkUrlChange();
  };

  window.addEventListener('popstate', checkUrlChange);

  callback();

  return () => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    window.removeEventListener('popstate', checkUrlChange);
  };
};
