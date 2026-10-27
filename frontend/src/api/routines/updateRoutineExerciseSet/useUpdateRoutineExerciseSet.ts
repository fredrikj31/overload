import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { updateRoutineExerciseSet } from "./updateRoutineExerciseSet";
import { BodyPart } from "../../../types/bodyPart";
import { Equipment } from "../../../types/equipment";
import { Exercise } from "../../../types/exercise";
import { RoutineExercise } from "../../../types/routineExercise";
import { RoutineExerciseSet } from "../../../types/routineExerciseSet";

interface UpdateRoutineExerciseSetVariables {
  routineId: string;
  routineExerciseId: string;
  setId: string;
  body: Partial<
    Pick<RoutineExerciseSet, "type" | "reps" | "weightUnit" | "weight">
  >;
}

export const useUpdateRoutineExerciseSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      routineId,
      routineExerciseId,
      setId,
      body,
    }: UpdateRoutineExerciseSetVariables) => {
      return updateRoutineExerciseSet(
        routineId,
        routineExerciseId,
        setId,
        body,
      );
    },
    onSuccess: (updated, { routineId, routineExerciseId }) => {
      // Swap the set in the cached list right away so the row shows the new
      // values without a round trip, then refetch to stay in sync.
      queryClient.setQueryData<
        (Pick<
          RoutineExercise,
          "id" | "routineId" | "exerciseId" | "position"
        > & {
          exercise: Pick<Exercise, "id" | "name" | "imagePath"> & {
            bodyPart: Pick<BodyPart, "id" | "name" | "slug"> | null;
            equipment: Pick<Equipment, "id" | "name" | "slug">;
          };
          sets: Pick<
            RoutineExerciseSet,
            | "id"
            | "routineExerciseId"
            | "position"
            | "type"
            | "reps"
            | "weightUnit"
            | "weight"
          >[];
        })[]
      >(queryKeys.routines.exercises(routineId), (items) =>
        items?.map((item) =>
          item.id === routineExerciseId
            ? {
                ...item,
                sets: item.sets.map((set) =>
                  set.id === updated.id ? updated : set,
                ),
              }
            : item,
        ),
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.routines.exercises(routineId),
      });
    },
  });
};
