import Analayzer from './components/Analyzer/Analyzer';
import SidebarTrigger from './components/PanelWrapper/SidebarTrigger';
import TopbarTrigger from './components/PanelWrapper/TopbarTrigger';
import { createRoot } from 'react-dom/client';
import { observeForGameInfoSections } from './page/matchObserver';
import { observeForPanelSection } from './page/panelObserver';
import { injectScript } from './utils/scripts';
import { FaceitMatch } from './api/faceit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

injectScript();

const queryClient = new QueryClient();
let matchApiResponse: FaceitMatch;

window.addEventListener('matchApi', (event) => {
  matchApiResponse = event.detail;
  const matchId = matchApiResponse.id;

  document.querySelectorAll('.react-root-match').forEach((element) => {
    const el = element as HTMLElement;
    if (el.dataset.matchId !== matchId) {
      el.remove();
    }
  });

  observeForGameInfoSections((rootElement) => {
    createRoot(rootElement).render(
      <QueryClientProvider client={queryClient}>
        <Analayzer matchData={matchApiResponse} />
      </QueryClientProvider>
    );
  }, matchId);
});

const extractMatchIdFromUrl = (url: string) => {
  const match = url.match(
    /faceit\.com\/[^/]+\/cs2\/room\/(1-[a-f0-9-]+)(?:\/)?$/i
  );
  return match ? match[1] : null;
};

window.addEventListener('urlChange', (event) => {
  if (!matchApiResponse) return;

  const urlMatchId = extractMatchIdFromUrl(event.detail);
  const apiMatchId = matchApiResponse.id;

  if (urlMatchId !== apiMatchId) {
    document.querySelectorAll('.react-root-match').forEach((element) => {
      element.remove();
    });
    return;
  }

  document.querySelectorAll('.react-root-match').forEach((element) => {
    const el = element as HTMLElement;
    if (el.dataset.matchId !== urlMatchId) {
      el.remove();
    }
  });

  observeForGameInfoSections((rootElement) => {
    createRoot(rootElement).render(
      <QueryClientProvider client={queryClient}>
        <Analayzer matchData={matchApiResponse} />
      </QueryClientProvider>
    );
  }, urlMatchId);
});

observeForPanelSection(({ root, pos }) => {
  createRoot(root).render(
    <QueryClientProvider client={queryClient}>
      {pos === 'side' ? <SidebarTrigger /> : <TopbarTrigger />}
    </QueryClientProvider>
  );
});
