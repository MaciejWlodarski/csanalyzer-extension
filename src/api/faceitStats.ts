import { z } from "zod";

export const faceitMatchStatsSchema = z
  .object({
    matchId: z.string(),
    matchRound: z.string(),
    date: z.number(),
    i18: z.string(),
  })
  .transform(({ matchId, matchRound, date, i18 }) => ({
    matchId,
    matchRound: Number(matchRound),
    date,
    score: i18,
  }));
export type FaceitMatchStats = z.infer<typeof faceitMatchStatsSchema>;
