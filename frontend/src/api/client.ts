import axios, { isAxiosError } from "axios";
import { config } from "../config";
import { ApiError, ApiErrorBodySchema } from "./errors";

export const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  withCredentials: true,
});

// Normalise failed responses into `ApiError` so callers don't need to know
// about axios. Network errors (no response) are rethrown as-is.
apiClient.interceptors.response.use(undefined, (error: unknown) => {
  if (isAxiosError(error) && error.response) {
    const { status } = error.response;
    const data: unknown = error.response.data;
    const parsed = ApiErrorBodySchema.safeParse(data);

    throw new ApiError(
      status,
      parsed.success ? parsed.data.code : "unknown-error",
      parsed.success
        ? parsed.data.message
        : `Request failed with status ${status}`,
    );
  }

  throw error;
});
