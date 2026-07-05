import MatchPageWidget from './components/MatchPageWidget/MatchPageWidget';
import SidebarTrigger from './components/PanelWrapper/SidebarTrigger';
import TopbarTrigger from './components/PanelWrapper/TopbarTrigger';
import { createRoot, Root } from 'react-dom/client';
import { observeForGameInfoSections } from './page/matchObserver';
import { observeForPanelSection } from './page/panelObserver';
import { injectScript } from './utils/scripts';
import { FaceitMatch, fetchFaceitMatch } from './api/faceit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

injectScript();

const queryClient = new QueryClient();
const matchWidgetRoots = new WeakMap<Element, Root>();
let matchApiResponse: FaceitMatch | undefined;
let pendingMatchId: string | null = null;

const extractMatchIdFromUrl = (url: string) => {
  const match = url.match(
    /faceit\.com\/[^/]+\/cs2\/room\/(1-[a-f0-9-]+)(?:\/)?$/i
  );
  return match ? match[1] : null;
};

const renderMatchWidget = (
  rootElement: HTMLDivElement,
  matchData: FaceitMatch
) => {
  const root =
    matchWidgetRoots.get(rootElement) ??
    (() => {
      const createdRoot = createRoot(rootElement);
      matchWidgetRoots.set(rootElement, createdRoot);
      return createdRoot;
    })();

  root.render(
    <QueryClientProvider client={queryClient}>
      <MatchPageWidget matchData={matchData} />
    </QueryClientProvider>
  );
};

const removeMatchWidgetsExcept = (matchId: string) => {
  document.querySelectorAll('.react-root-match').forEach((element) => {
    const el = element as HTMLElement;
    if (el.dataset.matchId !== matchId) {
      el.remove();
    }
  });
};

const renderMatchData = (matchData: FaceitMatch) => {
  matchApiResponse = matchData;
  removeMatchWidgetsExcept(matchData.id);

  observeForGameInfoSections((rootElement) => {
    renderMatchWidget(rootElement, matchData);
  }, matchData.id);
};

const loadMatchFromUrl = async (url: string) => {
  const matchId = extractMatchIdFromUrl(url);
  if (!matchId || pendingMatchId === matchId) return;

  if (matchApiResponse?.id === matchId) {
    renderMatchData(matchApiResponse);
    return;
  }

  pendingMatchId = matchId;

  try {
    renderMatchData(await fetchFaceitMatch(matchId));
  } catch (error) {
    console.error('Failed to fetch FACEIT match data:', error);
  } finally {
    if (pendingMatchId === matchId) {
      pendingMatchId = null;
    }
  }
};

const handleUrlChange = (url: string) => {
  const matchId = extractMatchIdFromUrl(url);

  if (!matchId) {
    document.querySelectorAll('.react-root-match').forEach((element) => {
      element.remove();
    });
    matchApiResponse = undefined;
    return;
  }

  void loadMatchFromUrl(url);
};

window.addEventListener('matchApi', (event) => {
  renderMatchData(event.detail);
});

window.addEventListener('urlChange', (event) => {
  handleUrlChange(event.detail);
});

observeForPanelSection(({ root, pos }) => {
  createRoot(root).render(
    <QueryClientProvider client={queryClient}>
      {pos === 'side' ? <SidebarTrigger /> : <TopbarTrigger />}
    </QueryClientProvider>
  );
});

void loadMatchFromUrl(location.href);
