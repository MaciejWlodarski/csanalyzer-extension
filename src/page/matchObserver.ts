let activeObserver: MutationObserver | null = null;

const ROOT_CLASS = 'react-root-match';

const rootSelector = (matchId: string, index: number) =>
  `.${ROOT_CLASS}[data-match-id="${matchId}"][data-section-index="${index}"]`;

const findExistingRoot = (matchId: string, index: number) =>
  document.querySelector(rootSelector(matchId, index));

const createRootElementAfter = (
  section: Element,
  matchId: string,
  index: number
) => {
  const root = document.createElement('div');
  root.classList.add(ROOT_CLASS);
  root.dataset.matchId = matchId;
  root.dataset.sectionIndex = String(index);
  section.parentNode?.insertBefore(root, section.nextSibling);
  return root;
};

const createRootElementInside = (
  container: Element,
  matchId: string,
  index: number
) => {
  const root = document.createElement('div');
  root.classList.add(ROOT_CLASS);
  root.dataset.matchId = matchId;
  root.dataset.sectionIndex = String(index);
  container.appendChild(root);
  return root;
};

const ensureRootInOverviewStack = (
  callback: (root: HTMLDivElement) => void,
  matchId: string
): number => {
  const stack = document.querySelector('div[class^="Overview__Stack"]');
  if (!stack) return 0;

  const index = 0;
  const existing = findExistingRoot(matchId, index);

  if (existing) {
    if (existing.parentElement !== stack) {
      stack.appendChild(existing);
    }
    return 1;
  }

  const root = createRootElementInside(stack, matchId, index);
  callback(root);
  return 1;
};

const ensureRootsForAllSections = (
  callback: (root: HTMLDivElement) => void,
  matchId: string
): number => {
  const sections = document.querySelectorAll('div[class^="Finished__Section"]');

  if (sections.length === 0) {
    return ensureRootInOverviewStack(callback, matchId);
  }

  sections.forEach((section, index) => {
    const existing = findExistingRoot(matchId, index);
    const isPlacedAfterThisSection =
      existing && section.nextElementSibling === existing;

    if (existing) {
      if (!isPlacedAfterThisSection) {
        section.parentNode?.insertBefore(existing, section.nextSibling);
      }
      return;
    }

    const root = createRootElementAfter(section, matchId, index);
    callback(root);
  });

  return sections.length;
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
      ensureRootsForAllSections(callback, matchId);
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
