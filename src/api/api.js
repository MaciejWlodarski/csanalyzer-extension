const getRealDemoUrl = async (demoUrl) => {
  const url = "https://www.faceit.com/api/download/v2/demos/download-url";

  const payload = {
    resource_url: demoUrl,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.payload.download_url;
  } catch (error) {
    console.error("Error fetching real demo URL:", error.message);
    return null;
  }
};

export const getAnalyzerStatus = async (matchId) => {
  const url = `https://collector.csanalyzer.gg/faceit/matches/${matchId}`;

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
  const url = `https://collector.csanalyzer.gg/faceit/matches/${matchId}/user-upload`;

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
  const analyzerStatus = await getAnalyzerStatus(matchId);

  const demoStatus = analyzerStatus.demos.find(
    ({ demo_url }) => demo_url === demoURL,
  );

  if (demoStatus && !demoStatus.quota_exceeded) {
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
    console.log(response);
  }
};
