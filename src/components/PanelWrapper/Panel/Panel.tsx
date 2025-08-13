import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DemoStatusRow from './DemoStatusRow/DemoStatusRow';
import { FaceitMatchStats, FaceitUser, fetchFaceitMatches } from '@/api/faceit';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnalyzerDemoState, fetchAnalyzerGameStatuses } from '@/api/analyzer';
import { Button } from '@/components/ui/button';
import Search from './Search/Search';
import Logo from '@/components/Icons/Logo';
import Icon from '@/components/Icons/Icon';
import SteamIcon from '@/components/Icons/SteamIcon';
import FaceitIcon from '@/components/Icons/FaceitIcon';

const Panel = () => {
  const [user, setUser] = useState<FaceitUser | null>(null);
  const steamId32 = BigInt(user?.games.cs2?.game_id ?? 0) - 76561197960265728n;

  const {
    data: matches,
    isFetching: isLoadingMatches,
    isError: isMatchesError,
    error: matchesError,
  } = useQuery<FaceitMatchStats[], Error>({
    queryKey: ['faceit-matches', user?.id],
    queryFn: () => fetchFaceitMatches(user!.id),
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  const matchKey = matches
    ?.map((m) => `${m.matchId}-${m.matchRound}`)
    .join(',');

  const {
    data: demoStates,
    isFetching: isLoadingDemos,
    isError: isDemosError,
    error: demosError,
  } = useQuery<Map<string, AnalyzerDemoState | undefined>>({
    queryKey: ['analyzer-statuses', !!matches, matchKey],
    queryFn: async () => {
      const uniqueMatchIds = Array.from(
        new Set(matches!.map((m) => m.matchId))
      );

      const statuses = await fetchAnalyzerGameStatuses(uniqueMatchIds);
      const result = new Map<string, AnalyzerDemoState | undefined>();

      for (const m of matches!) {
        const matchStatus = statuses.find((s) => s.matchId === m.matchId);

        if (!matchStatus || !matchStatus.exists) {
          result.set(m.matchId, undefined);
          continue;
        }

        const demo = matchStatus.demos[m.matchRound - 1];
        result.set(m.matchId, demo);
      }

      return result;
    },
    enabled: !!matches && matches.length > 0,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="grid h-full grid-rows-[auto,_1fr] flex-col">
      <div className="rounded-t-xl border border-neutral-800 bg-neutral-900 p-4">
        <a href="https://csanalyzer.gg/">
          <Logo className="m-min h-5" />
        </a>
      </div>
      <div className="flex h-full flex-col justify-start gap-4 overflow-auto rounded-b-xl border border-t-0 border-neutral-800 bg-neutral-950 p-4">
        <Search onSuccess={setUser} />

        {user && user.games.cs2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img src={user.avatar} className="size-12 rounded-lg" />
              <div className="flex w-full flex-col gap-1">
                <span className="font-bold">{user.nickname}</span>
                <div className="flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-6"
                    asChild
                  >
                    <a href={`http://csanalyzer.gg/app/profile/${steamId32}`}>
                      <Icon className="m-min h-4" />
                    </a>
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-6"
                    asChild
                  >
                    <a
                      href={`https://steamcommunity.com/profiles/${user.games.cs2.game_id}`}
                    >
                      <SteamIcon className="m-min h-4" />
                    </a>
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-6"
                    asChild
                  >
                    <a href={`https://www.faceit.com/players/${user.nickname}`}>
                      <FaceitIcon className="m-min h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isMatchesError && (
          <div className="text-sm text-red-500">
            Error loading matches: {matchesError.message}
          </div>
        )}

        {isDemosError && (
          <div className="text-sm text-red-500">
            Error loading demo states: {demosError.message}
          </div>
        )}

        {isLoadingMatches && (
          <div className="text-sm text-neutral-400">Loading matches…</div>
        )}

        {matches && (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[30%]">Date</TableHead>
                <TableHead className="w-[20%]">Score</TableHead>
                <TableHead className="w-1/2">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => {
                const demo = demoStates?.get(match.matchId);
                return (
                  <DemoStatusRow
                    key={`${match.matchId}-${match.matchRound}`}
                    match={match}
                    demo={demo}
                    isBatchLoading={isLoadingDemos}
                  />
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Panel;
