let activeObserver = null;
let currentRootElement = null;

const createRootElement = (sidebarSection) => {
  const rootElement = document.createElement("div");
  rootElement.id = "react-root-sidebar";

  sidebarSection.appendChild(rootElement);

  currentRootElement = rootElement;
  return rootElement;
};

const handleSidebarSection = (callback) => {
  const sections = document.querySelectorAll(
    'div[class^="styles__TopContent"]',
  );
  const sidebarSection = sections[sections.length - 1];

  if (sidebarSection) {
    const rootElement = createRootElement(sidebarSection);
    callback(rootElement);
    return true;
  }

  return false;
};

export const observeForSidebarSection = (callback) => {
  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }

  if (currentRootElement) {
    currentRootElement.remove();
    currentRootElement = null;
  }

  if (handleSidebarSection(callback)) {
    return;
  }

  const observer = new MutationObserver((_, obs) => {
    if (handleSidebarSection(callback)) {
      obs.disconnect();
      activeObserver = null;
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  activeObserver = observer;
};
