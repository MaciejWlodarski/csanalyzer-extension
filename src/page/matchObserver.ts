let activeObserver: MutationObserver | null = null;
let currentRootElement: HTMLDivElement | null = null;

const createRootElement = (
  gameInfoSection: Element,
  matchId: string
): HTMLDivElement => {
  const rootElement = document.createElement('div');
  rootElement.id = 'react-root-match';
  rootElement.dataset.matchId = matchId;

  if (gameInfoSection.parentNode) {
    gameInfoSection.parentNode.insertBefore(
      rootElement,
      gameInfoSection.nextSibling
    );
  }

  currentRootElement = rootElement;
  return rootElement;
};

const handleGameInfoSection = (
  callback: (root: HTMLDivElement) => void,
  matchId: string
): boolean => {
  const sections = document.querySelectorAll('div[class^="Finished__Section"]');
  const gameInfoSection = sections[sections.length - 1];

  if (gameInfoSection) {
    const rootElement = createRootElement(gameInfoSection, matchId);
    callback(rootElement);
    return true;
  }

  return false;
};

export const observeForGameInfoSection = (
  callback: (root: HTMLDivElement) => void,
  matchId: string
): void => {
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

  const observer = new MutationObserver(() => {
    if (handleGameInfoSection(callback, matchId)) {
      observer.disconnect();
      activeObserver = null;
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  activeObserver = observer;
};
