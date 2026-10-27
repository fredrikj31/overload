import { apiClient } from "../../client";

/** Deletes a routine owned by the signed-in user. The API responds 204. */
export const deleteRoutine = async (id: string): Promise<void> => {
  await apiClient.delete(`/routines/${encodeURIComponent(id)}`);
};
