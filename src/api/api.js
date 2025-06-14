const BASE_URL = "csanalyzer.gg";
const COLLECTOR_URL = `https://collector.${BASE_URL}`;
const ART_URL = `https://art.${BASE_URL}`;

const getRealDemoUrl = async (demoUrl) => {
  const url = "https://www.faceit.com/api/download/v2/demos/download-url";
  const payload = { resource_url: demoUrl };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = new Error(`HTTP error: ${response.status}`);
      error.code = response.status;
      throw error;
    }

    const data = await response.json();
    return data.payload.download_url;
  } catch (error) {
    if (error.code === undefined) {
      error.code = 0;
    }
    console.error("Error fetching real demo URL:", error.message);
    throw error;
  }
};

export const getAnalyzerDemoStatus = async (matchId) => {
  const url = `${COLLECTOR_URL}/faceit/matches/${matchId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching analyzer status:", error);
    throw error;
  }
};

const sendDemoUrl = async (matchId, demoUrl, realDemoUrl) => {
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
    return data;
  } catch (error) {
    console.error("Error sending POST request:", error);
  }
};

export const sendDemoToAnalyzer = async (matchId, demoURL) => {
  const analyzerStatus = await getAnalyzerDemoStatus(matchId);

  const demoStatus = analyzerStatus.demos.find(
    ({ demo_url }) => demo_url === demoURL,
  );

  if (
    demoStatus &&
    !demoStatus.quota_exceeded &&
    demoStatus.status !== "waiting"
  ) {
    return { demo_id: demoStatus.demo_id };
  }

  const realDemoUrl = await getRealDemoUrl(demoURL);

  const response = await sendDemoUrl(matchId, demoURL, realDemoUrl);
  return response;
};

export const sendDemosToAnalyzer = async (
  matchId,
  demoUrls,
  analyzerStatus,
) => {
  const { demos: analyzerDemos } = analyzerStatus;

  for (const demoUrl of demoUrls) {
    const stateInAnalyzer = analyzerDemos.find(
      (demo) => demo.demo_url === demoUrl,
    );

    if (stateInAnalyzer) continue;

    const realDemoUrl = await getRealDemoUrl(demoUrl);
    const response = await sendDemoUrl(matchId, demoUrl, realDemoUrl);

    return response;
  }
};

export const getAnalyzerMatchStatus = async (demoId) => {
  const url = `${ART_URL}/demos/${demoId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching analyzer match id:", error);
    throw error;
  }
};

export const getAnalyzerMatchId = async (demoId) => {
  if (!demoId) return null;

  const matchStatus = await getAnalyzerMatchStatus(demoId);
  return matchStatus.latest_match_id;
};
