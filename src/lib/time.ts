export const secondsToHMS = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let hms: string = "";
  if (hours > 0) hms += `${hours.toString().padStart(2, "0")}h`;
  if (minutes > 0) hms += `${minutes.toString().padStart(2, "0")}m`;
  if (remainingSeconds > 0)
    hms += `${remainingSeconds.toString().padStart(2, "0")}s`;

  return hms;
};
