type PanelPosition = 'side' | 'top';

interface PanelCallbackPayload {
  root: HTMLDivElement;
  pos: PanelPosition;
}

export const observeForPanelSection = (
  callback: (payload: PanelCallbackPayload) => void
): void => {
  const ensureRootExists = () => {
    if (document.getElementById('react-root-panel')) return;

    const sidebar = document.querySelector<HTMLDivElement>(
      'div[class^="styles__TopContent"]'
    );
    const topbar = document.querySelector<HTMLDivElement>(
      'div[class^="styles__TopBarContainer"]'
    );
    const container = sidebar || topbar;

    if (!container) return;

    const rootElement = document.createElement('div');
    rootElement.id = 'react-root-panel';
    rootElement.style.width = '100%';

    if (topbar && container === topbar && container.childNodes.length >= 1) {
      const secondChild = container.childNodes[1] || null;
      container.insertBefore(rootElement, secondChild);
    } else {
      container.appendChild(rootElement);
    }

    callback({
      root: rootElement,
      pos: sidebar ? 'side' : 'top',
    });
  };

  ensureRootExists();

  new MutationObserver(ensureRootExists).observe(document.body, {
    childList: true,
    subtree: true,
  });
};
