let activeObserver: MutationObserver | null = null;
let currentRootElement: HTMLDivElement | null = null;

const createRootElement = (section: Element, matchId: string) => {
  const root = document.createElement('div');
  root.id = 'react-root-match';
  root.dataset.matchId = matchId;
  section.parentNode?.insertBefore(root, section.nextSibling);
  return root;
};

const ensureSingleRootAtLastSection = (
  callback: (root: HTMLDivElement) => void,
  matchId: string
): boolean => {
  const sections = document.querySelectorAll('div[class^="Finished__Section"]');
  if (sections.length === 0) return false;

  const lastSection = sections[sections.length - 1];

  if (currentRootElement && document.body.contains(currentRootElement)) {
    const isAlreadyAfterLast =
      lastSection.nextElementSibling === currentRootElement;

    if (!isAlreadyAfterLast) {
      lastSection.parentNode?.insertBefore(
        currentRootElement,
        lastSection.nextSibling
      );
    }
    return true;
  }

  const root = createRootElement(lastSection, matchId);
  currentRootElement = root;
  callback(root);
  return true;
};

export const observeForGameInfoSections = (
  callback: (root: HTMLDivElement) => void,
  matchId: string,
  maxDurationMs = 1000
) => {
  activeObserver?.disconnect();
  activeObserver = null;

  const stop = () => {
    activeObserver?.disconnect();
    activeObserver = null;
  };

  const timeoutId = setTimeout(stop, maxDurationMs);

  const tick = () => {
    requestAnimationFrame(() => {
      ensureSingleRootAtLastSection(callback, matchId);
    });
  };

  tick();

  const observer = new MutationObserver(tick);
  observer.observe(document.body ?? document.documentElement, {
    childList: true,
    subtree: true,
  });
  activeObserver = observer;

  return () => {
    clearTimeout(timeoutId);
    stop();
  };
};
