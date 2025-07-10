export const getFaceitUser = async (nickname) => {
  const url = `https://www.faceit.com/api/users/v1/nicknames/${encodeURIComponent(nickname)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Błąd podczas pobierania danych użytkownika:", error.message);
    return null;
  }
};

export const getMatches = async (userId, page = 0, size = 30) => {
  const url = `https://www.faceit.com/api/stats/v1/stats/time/users/${encodeURIComponent(
    userId,
  )}/games/cs2?page=${page}&size=${size}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Błąd podczas pobierania meczów:", error.message);
    return null;
  }
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};
