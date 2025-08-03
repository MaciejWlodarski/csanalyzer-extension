import { z } from 'zod';
import camelcaseKeys from 'camelcase-keys';

const mapVetoEntitySchema = z
  .object({
    class_name: z.string(),
    game_map_id: z.string(),
    guid: z.string(),
    image_lg: z.string(),
    image_sm: z.string(),
    name: z.string(),
  })
  .transform((data) => camelcaseKeys(data, { deep: true }));
export type MapVetoEntity = z.infer<typeof mapVetoEntitySchema>;

const matchCustom = z.object({
  tree: z.object({
    map: z.object({
      flags: z.object({
        votable: z.boolean(),
      }),
      values: z.object({
        value: z.union([z.array(mapVetoEntitySchema), mapVetoEntitySchema]),
      }),
    }),
  }),
});

const mapVetoSchema = z.object({
  entities: z.array(mapVetoEntitySchema),
  pick: z.array(z.string()),
});
export type MapVeto = z.infer<typeof mapVetoSchema>;

const faceitMatchSchema = z.object({
  id: z.string(),
  demoURLs: z.array(z.string()).optional(),
  matchCustom: matchCustom,
  voting: z.object({ map: mapVetoSchema.optional() }).optional(),
});
export type FaceitMatch = z.infer<typeof faceitMatchSchema>;

const faceitMatchStatsSchema = z
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

type InterceptedPayload =
  | { label: 'match'; payload: FaceitMatch }
  | { label: 'stats'; payload: FaceitMatchStats[] };

export const interceptApiData = (
  callback: (data: InterceptedPayload) => void
): void => {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method: string, url: string) {
    (this as any)._interceptedUrl = url;
    return originalOpen.apply(this, arguments as any);
  };

  XMLHttpRequest.prototype.send = function () {
    this.addEventListener('readystatechange', function () {
      if (this.readyState === 4 && this.status === 200) {
        const url: string = (this as any)._interceptedUrl;

        const isMatchEndpoint = url.includes('/api/match/v2/match/');
        const isStatsGamesEndpoint =
          /\/api\/stats\/v1\/stats\/time\/users\/[^/]+\/games\/cs2(?:\?.*)?$/.test(
            url
          );

        if (isMatchEndpoint || isStatsGamesEndpoint) {
          try {
            const response = JSON.parse(this.responseText);

            if (isMatchEndpoint && response?.payload) {
              const parsed = faceitMatchSchema.parse(response.payload);
              callback({ label: 'match', payload: parsed });
            } else if (isStatsGamesEndpoint) {
              const parsed = faceitMatchStatsSchema.array().parse(response);
              callback({ label: 'stats', payload: parsed });
            }
          } catch (error) {
            console.error('Zod parsing or JSON error:', error);
          }
        }
      }
    });

    return originalSend.apply(this, arguments as any);
  };
};

const faceitUserSchema = z.object({
  id: z.string(),
  avatar: z.string(),
  nickname: z.string(),
  games: z.object({
    cs2: z
      .object({
        game_id: z.string(),
        faceit_elo: z.number(),
      })
      .optional(),
  }),
});
export type FaceitUser = z.infer<typeof faceitUserSchema>;

export const fetchFaceitUser = async (nickname: string) => {
  const url = `https://www.faceit.com/api/users/v1/nicknames/${encodeURIComponent(nickname)}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

  const schema = z.object({ payload: faceitUserSchema });
  return schema.parse(await response.json()).payload;
};

export const fetchFaceitMatches = async (
  userId: string,
  page = 0,
  size = 30
) => {
  const url = `https://www.faceit.com/api/stats/v1/stats/time/users/${encodeURIComponent(
    userId
  )}/games/cs2?page=${page}&size=${size}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

  return faceitMatchStatsSchema.array().parse(await response.json());
};

export const fetchFaceitMatch = async (matchId: string) => {
  const url = `https://www.faceit.com/api/match/v2/match/${matchId}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

  const schema = z.object({ payload: faceitMatchSchema });
  return schema.parse(await response.json()).payload;
};

const realDemoUrlSchema = z
  .object({ payload: z.object({ download_url: z.string() }) })
  .transform((data) => camelcaseKeys(data, { deep: true }));

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const fetchRealDemoUrl = async (demoUrl: string) => {
  const url = 'https://www.faceit.com/api/download/v2/demos/download-url';
  const payload = { resource_url: demoUrl };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new HttpError(response.status, `HTTP error: ${response.status}`);
  }

  const parsed = realDemoUrlSchema.parse(await response.json());
  return parsed.payload.downloadUrl;
};
