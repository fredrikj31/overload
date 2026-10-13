import { config } from "../config";

/**
 * Builds an absolute URL for a media path returned by the API
 * (e.g. "exercises/images/0001-abc.jpg").
 */
export const getMediaUrl = (path: string): string => {
  const base = config.media.baseUrl.replace(/\/+$/, "");
  const relative = path.replace(/^\/+/, "");

  return `${base}/${relative}`;
};
