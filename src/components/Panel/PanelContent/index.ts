export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);

  const formattedDate = date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
  });

  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${formattedDate} - ${formattedTime}`;
};
