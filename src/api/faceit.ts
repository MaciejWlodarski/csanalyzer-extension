import { z } from "zod";
import camelcaseKeys from "camelcase-keys";

const mapVetoEntitySchema = z
  .object({
    class_name: z.string(),
    game_map_id: z.string(),
    guid: z.string(),
    image_lg: z.string(),
    image_sm: z.string(),
    name: z.string(),
  })
  .transform((data) => {
    return camelcaseKeys(data, { deep: true });
  });
export type MapVetoEntity = z.infer<typeof mapVetoEntitySchema>;

const mapVetoSchema = z.object({
  entities: z.array(mapVetoEntitySchema),
  pick: z.array(z.string()),
});
export type MapVeto = z.infer<typeof mapVetoSchema>;

const faceitMatchSchema = z.object({
  id: z.string(),
  demoURLs: z.array(z.string()),
  voting: z.object({
    map: mapVetoSchema,
  }),
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
  | { label: "match"; payload: FaceitMatch }
  | { label: "stats"; payload: FaceitMatchStats[] };

export const interceptApiData = (
  callback: (data: InterceptedPayload) => void,
): void => {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method: string, url: string) {
    (this as any)._interceptedUrl = url;
    return originalOpen.apply(this, arguments as any);
  };

  XMLHttpRequest.prototype.send = function () {
    this.addEventListener("readystatechange", function () {
      if (this.readyState === 4 && this.status === 200) {
        const url: string = (this as any)._interceptedUrl;

        const isMatchEndpoint = url.includes("/api/match/v2/match/");
        const isStatsGamesEndpoint =
          /\/api\/stats\/v1\/stats\/time\/users\/[^/]+\/games\/cs2(?:\?.*)?$/.test(
            url,
          );

        if (isMatchEndpoint || isStatsGamesEndpoint) {
          try {
            const response = JSON.parse(this.responseText);

            if (isMatchEndpoint && response?.payload) {
              const parsed = faceitMatchSchema.parse(response.payload);
              callback({ label: "match", payload: parsed });
            } else if (isStatsGamesEndpoint) {
              const parsed = faceitMatchStatsSchema.array().parse(response);
              callback({ label: "stats", payload: parsed });
            }
          } catch (error) {
            console.error("Zod parsing or JSON error:", error);
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
});
export type FaceitUser = z.infer<typeof faceitUserSchema>;

export const fetchFaceitUser = async (nickname: string) => {
  const url = `https://www.faceit.com/api/users/v1/nicknames/${encodeURIComponent(nickname)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return faceitUserSchema.parse(data.payload);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error while fetching user data:", error.message);
      throw error;
    } else {
      console.error("Unknown error:", error);
      throw new Error("Unknown error while fetching user");
    }
  }
};

export const fetchFaceitMatches = async (
  userId: string,
  page = 0,
  size = 30,
) => {
  const url = `https://www.faceit.com/api/stats/v1/stats/time/users/${encodeURIComponent(
    userId,
  )}/games/cs2?page=${page}&size=${size}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return faceitMatchStatsSchema.array().parse(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error while fetching user matches:", error.message);
      throw error;
    } else {
      console.error("Unknown error:", error);
      throw new Error("Unknown error while fetching user matches");
    }
  }
};

export const fetchFaceitMatch = async (matchId: string) => {
  const url = `https://www.faceit.com/api/match/v2/match/${matchId}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const parsed = faceitMatchSchema.parse(data.payload);

    return parsed;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Fetch error:", error.message);
      throw error;
    }
    console.error("Unknown error:", error);
    throw error;
  }
};
