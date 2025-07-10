let activeObserver = null;
let currentRootElement = null;

const createRootElement = (gameInfoSection, matchId) => {
  const rootElement = document.createElement("div");
  rootElement.id = "react-root-match";
  rootElement.dataset.matchId = matchId;

  gameInfoSection.parentNode.insertBefore(
    rootElement,
    gameInfoSection.nextSibling,
  );

  currentRootElement = rootElement;
  return rootElement;
};

const handleGameInfoSection = (callback, matchId) => {
  const sections = document.querySelectorAll('div[class^="Finished__Section"]');
  const gameInfoSection = sections[sections.length - 1];

  if (gameInfoSection) {
    const rootElement = createRootElement(gameInfoSection, matchId);
    callback(rootElement);
    return true;
  }

  return false;
};

export const observeForGameInfoSection = (callback, matchId) => {
  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }

  if (currentRootElement) {
    currentRootElement.remove();
    currentRootElement = null;
  }

  if (handleGameInfoSection(callback, matchId)) {
    return;
  }

  const observer = new MutationObserver((_, obs) => {
    if (handleGameInfoSection(callback, matchId)) {
      obs.disconnect();
      activeObserver = null;
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  activeObserver = observer;
};
