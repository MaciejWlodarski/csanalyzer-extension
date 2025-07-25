import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DemoStatusRow from './DemoStatusRow/DemoStatusRow';
import {
  FaceitMatchStats,
  FaceitUser,
  fetchFaceitUser,
  fetchFaceitMatches,
} from '@/api/faceit';
import { FormEvent, memo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';

const Panel = () => {
  const [nickname, setNickname] = useState('');

  const userMutation = useMutation<FaceitUser, Error, string>({
    mutationFn: fetchFaceitUser,
  });

  const user = userMutation.data;

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

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      userMutation.mutate(nickname.trim());
    }
  };

  return (
    <div className="grid h-full grid-rows-[auto,_1fr] flex-col">
      <div className="rounded-t-xl border border-neutral-800 bg-neutral-900 p-4">
        <a href="https://csanalyzer.gg/">
          <img
            src={chrome.runtime.getURL('assets/logo.svg')}
            alt="CSAnalyzer.gg"
            className="h-5 w-min"
          />
        </a>
      </div>
      <div className="flex h-full flex-col justify-start gap-4 overflow-auto rounded-b-xl border border-t-0 border-neutral-800 bg-neutral-950 p-4">
        <form
          className="grid w-full grid-cols-[3fr,_2fr] items-center gap-2"
          onSubmit={handleSearch}
        >
          <Input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <Button type="submit" disabled={userMutation.isPending}>
            {userMutation.isPending ? (
              <>
                <LoaderCircle className="animate-spin" />
                Please wait
              </>
            ) : (
              'Search'
            )}
          </Button>
        </form>

        {userMutation.isError && (
          <div className="text-sm text-red-500">
            Error: {userMutation.error.message}
          </div>
        )}

        {user && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img src={user.avatar} className="size-12 rounded-lg" />
              <span className="font-bold">{user.nickname}</span>
            </div>
          </div>
        )}

        {isMatchesError && (
          <div className="text-sm text-red-500">
            Error loading matches: {matchesError.message}
          </div>
        )}

        {isLoadingMatches && (
          <div className="text-sm text-neutral-400">Loading matches…</div>
        )}

        {matches && (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Date</TableHead>
                <TableHead className="w-[20%]">Score</TableHead>
                <TableHead className="w-1/2">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => (
                <DemoStatusRow key={match.matchId} match={match} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Panel;
