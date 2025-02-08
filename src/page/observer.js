let activeObserver = null;
let currentRootElement = null;

const createRootElement = (gameInfoSection) => {
  const rootElement = document.createElement("div");
  rootElement.id = "react-root";

  gameInfoSection.parentNode.insertBefore(
    rootElement,
    gameInfoSection.nextSibling,
  );

  currentRootElement = rootElement;
  return rootElement;
};

const handleGameInfoSection = (callback) => {
  const gameInfoSection = document.querySelector(
    'div[class^="Finished__Section"]',
  );
  if (gameInfoSection) {
    const rootElement = createRootElement(gameInfoSection);
    callback(rootElement);
    return true;
  }
  return false;
};

export const observeForGameInfoSection = (callback) => {
  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }

  if (currentRootElement) {
    currentRootElement.remove();
    currentRootElement = null;
  }

  if (handleGameInfoSection(callback)) {
    return;
  }

  const observer = new MutationObserver((_, obs) => {
    if (handleGameInfoSection(callback)) {
      obs.disconnect();
      activeObserver = null;
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  activeObserver = observer;
};
