import { z } from "zod";
import camelcaseKeys from "camelcase-keys";

const analyzerStatusEnum = z.enum([
  "waiting",
  "queued",
  "processing",
  "failed",
  "success",
]);
export type AnalyzerStatus = z.infer<typeof analyzerStatusEnum>;

const analyzerDemoStatusSchema = z
  .object({
    status: analyzerStatusEnum,
    demo_id: z.string(),
    demo_url: z.string(),
    quota_exceeded: z.boolean(),
  })
  .transform((data) => {
    return camelcaseKeys(data, { deep: true });
  });
export type AnalyzerDemoStatus = z.infer<typeof analyzerDemoStatusSchema>;

const analyzerGameStatusSchema = z.object({
  exists: z.boolean(),
  demos: z.array(analyzerDemoStatusSchema),
});
export type AnalyzerGameStatus = z.infer<typeof analyzerGameStatusSchema>;

const realDemoUrlSchema = z
  .object({
    payload: z.object({
      download_url: z.string(),
    }),
  })
  .transform((data) => {
    return camelcaseKeys(data, { deep: true });
  });

const sendDemoUrlResponseSchema = z
  .object({
    demo_id: z.string(),
  })
  .transform(({ demo_id }) => ({ demoId: demo_id }));

const analyzerMatchStatusSchema = z
  .object({
    demo_id: z.string(),
    latest_match_id: z.number().nullable(),
    match_ids: z.array(z.number()),
  })
  .transform((data) => {
    return camelcaseKeys(data, { deep: true });
  });
export type AnalyzerMatchStatus = z.infer<typeof analyzerMatchStatusSchema>;

const BASE_URL = "csanalyzer.gg";
const COLLECTOR_URL = `https://collector.${BASE_URL}`;
const ART_URL = `https://art.${BASE_URL}`;

export interface CustomError extends Error {
  code: number;
}

const fetchRealDemoUrl = async (demoUrl: string) => {
  const url = "https://www.faceit.com/api/download/v2/demos/download-url";
  const payload = { resource_url: demoUrl };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = new Error(`HTTP error: ${response.status}`) as CustomError;
      error.code = response.status;
      throw error;
    }

    const json = await response.json();
    const parsed = realDemoUrlSchema.parse(json);
    return parsed.payload.downloadUrl;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "message" in error) {
      const typedError = error as CustomError;
      if (typedError.code === undefined) typedError.code = 0;
      console.error("Error fetching real demo URL:", typedError.message);
      throw typedError;
    } else {
      console.error("Unknown error:", error);
      throw error;
    }
  }
};

export const fetchAnalyzerGameStatus = async (matchId: string) => {
  const url = `${COLLECTOR_URL}/faceit/matches/${matchId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const json = await response.json();
    return analyzerGameStatusSchema.parse(json);
  } catch (error) {
    console.error("Error fetching analyzer status:", error);
    throw error;
  }
};

const sendDemoUrl = async (
  matchId: string,
  demoUrl: string,
  realDemoUrl: string,
) => {
  const url = `${COLLECTOR_URL}/faceit/matches/${matchId}/user-upload`;

  const body = {
    demo_url: demoUrl,
    real_demo_url: realDemoUrl,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return sendDemoUrlResponseSchema.parse(data);
  } catch (error) {
    console.error("Error sending POST request:", error);
    throw error;
  }
};

export const sendDemoToAnalyzer = async (matchId: string, demoURL: string) => {
  const analyzerStatus = await fetchAnalyzerGameStatus(matchId);

  const demoStatus = analyzerStatus.demos.find(
    ({ demoUrl: analyzerDemoUrl }) => analyzerDemoUrl === demoURL,
  );

  if (
    demoStatus &&
    !demoStatus.quotaExceeded &&
    demoStatus.status !== "waiting"
  ) {
    return { demoId: demoStatus.demoId };
  }

  const realDemoUrl = await fetchRealDemoUrl(demoURL);
  const response = await sendDemoUrl(matchId, demoURL, realDemoUrl);
  return response;
};

const fetchAnalyzerMatchStatus = async (demoId: string) => {
  const url = `${ART_URL}/demos/${demoId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return analyzerMatchStatusSchema.parse(data);
  } catch (error) {
    console.error("Error fetching analyzer match id:", error);
    throw error;
  }
};

export const getAnalyzerMatchId = async (demoId: string) => {
  const matchStatus = await fetchAnalyzerMatchStatus(demoId);
  return matchStatus.latestMatchId;
};

// export const sendDemosToAnalyzer = async (
//   matchId,
//   demoUrls,
//   analyzerStatus,
// ) => {
//   const { demos: analyzerDemos } = analyzerStatus;

//   for (const demoUrl of demoUrls) {
//     const stateInAnalyzer = analyzerDemos.find(
//       (demo) => demo.demo_url === demoUrl,
//     );

//     if (stateInAnalyzer) continue;

//     const realDemoUrl = await getRealDemoUrl(demoUrl);
//     const response = await sendDemoUrl(matchId, demoUrl, realDemoUrl);

//     return response;
//   }
// };
