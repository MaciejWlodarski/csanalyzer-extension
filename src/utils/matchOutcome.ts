export type Outcome = 'win' | 'loss' | 'draw';

export interface MatchResult {
  score: [number, number];
  outcome: Outcome;
}

export const getMatchOutcome = (
  result: string,
  playerScore: string
): MatchResult => {
  const [a, b] = result.split('/').map((s) => parseInt(s.trim(), 10));
  const player = parseInt(playerScore, 10);

  if (isNaN(a) || isNaN(b) || isNaN(player)) {
    throw new Error('Invalid input data');
  }

  const opponent = player === a ? b : a;

  let outcome: Outcome;
  if (player > opponent) outcome = 'win';
  else if (player < opponent) outcome = 'loss';
  else outcome = 'draw';

  return {
    score: [player, opponent],
    outcome,
  };
};
