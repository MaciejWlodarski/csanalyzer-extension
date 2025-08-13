let activeObserver: MutationObserver | null = null;
let currentRootElement: HTMLDivElement | null = null;

const createRootElement = (section: Element, matchId: string) => {
  const rootElement = document.createElement('div');
  rootElement.id = 'react-root-match';
  rootElement.dataset.matchId = matchId;

  section.parentNode?.insertBefore(rootElement, section.nextSibling);
  currentRootElement = rootElement;
  return rootElement;
};

const handleGameInfoSection = (
  callback: (root: HTMLDivElement) => void,
  matchId: string
) => {
  if (
    currentRootElement?.dataset.matchId === matchId &&
    document.body.contains(currentRootElement)
  ) {
    return true;
  }

  const sections = document.querySelectorAll('div[class^="Finished__Section"]');
  const gameInfoSection = sections[sections.length - 1];
  if (!gameInfoSection) return false;

  const rootElement = createRootElement(gameInfoSection, matchId);
  callback(rootElement);
  return true;
};

export const observeForGameInfoSection = (
  callback: (root: HTMLDivElement) => void,
  matchId: string
) => {
  activeObserver?.disconnect();
  activeObserver = null;

  if (currentRootElement && !document.body.contains(currentRootElement)) {
    currentRootElement = null;
  }

  if (handleGameInfoSection(callback, matchId)) {
    return () => {
      activeObserver?.disconnect();
      activeObserver = null;
      currentRootElement?.remove();
      currentRootElement = null;
    };
  }

  const target = document.body ?? document.documentElement;
  const observer = new MutationObserver(() => {
    requestAnimationFrame(() => {
      if (handleGameInfoSection(callback, matchId)) {
        observer.disconnect();
        activeObserver = null;
      }
    });
  });

  observer.observe(target, { childList: true, subtree: true });
  activeObserver = observer;

  return () => {
    observer.disconnect();
    if (activeObserver === observer) activeObserver = null;
    currentRootElement?.remove();
    currentRootElement = null;
  };
};
