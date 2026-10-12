export const formatDuration = (minutes: number): string => {
  if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  return `${minutes} min`;
};

export const formatVolume = (kg: number): string =>
  `${kg.toLocaleString("en-US")} kg`;
