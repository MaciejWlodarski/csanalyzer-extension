import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
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

const PanelContent = () => {
  const [nickname, setNickname] = useState<string>('');
  const [user, setUser] = useState<FaceitUser | null>(null);
  const [matches, setMatches] = useState<FaceitMatchStats[] | null>(null);

  const handleSearch = async () => {
    if (!nickname.trim()) return;

    const result = await fetchFaceitUser(nickname);
    if (result) {
      setUser(result);
      setMatches(null);
    } else {
      setUser(null);
      setMatches(null);
    }
  };

  const handleLoad = async () => {
    if (!user) return;

    const data = await fetchFaceitMatches(user.id);
    if (data) {
      setMatches(data);
    }
  };

  return (
    <div className="flex h-full w-full flex-col justify-start gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <form
        className="flex w-full max-w-sm items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <Input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>
      {user && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <img src={user.avatar} className="size-12 rounded-lg"></img>
            <span className="font-bold">{user.nickname}</span>
          </div>
          <div>
            <Button variant="outline" onClick={handleLoad}>
              Load matches
            </Button>
          </div>
        </div>
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
  );
};

export default PanelContent;
