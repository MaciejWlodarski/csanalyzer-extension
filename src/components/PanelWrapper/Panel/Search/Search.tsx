import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { fetchFaceitUser, FaceitUser } from '@/api/faceit';

const Search = ({ onSuccess }: { onSuccess: (user: FaceitUser) => void }) => {
  const [nickname, setNickname] = useState('');

  const userMutation = useMutation<FaceitUser, Error, string>({
    mutationFn: fetchFaceitUser,
    onSuccess,
  });

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      userMutation.mutate(nickname.trim());
    }
  };

  return (
    <form
      className="grid w-full grid-cols-[3fr,_2fr] items-center gap-2"
      onSubmit={handleSearch}
    >
      <Input
        type="text"
        placeholder="Nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        disabled={userMutation.isPending}
      />
      <Button type="submit" disabled={userMutation.isPending}>
        {userMutation.isPending ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </>
        ) : (
          'Search'
        )}
      </Button>

      {userMutation.isError && (
        <div className="col-span-2 text-sm text-red-500">
          Error: {userMutation.error.message}
        </div>
      )}
    </form>
  );
};

export default Search;
