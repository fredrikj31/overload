import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { addRoutineExerciseSet } from "./addRoutineExerciseSet";
import { BodyPart } from "../../../types/bodyPart";
import { Equipment } from "../../../types/equipment";
import { Exercise } from "../../../types/exercise";
import { RoutineExercise } from "../../../types/routineExercise";
import { RoutineExerciseSet } from "../../../types/routineExerciseSet";

interface AddRoutineExerciseSetVariables {
  routineId: string;
  routineExerciseId: string;
  body: Pick<RoutineExerciseSet, "reps"> &
    Partial<Pick<RoutineExerciseSet, "type" | "weightUnit" | "weight">>;
}

export const useAddRoutineExerciseSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      routineId,
      routineExerciseId,
      body,
    }: AddRoutineExerciseSetVariables) => {
      return addRoutineExerciseSet(routineId, routineExerciseId, body);
    },
    onSuccess: (created, { routineId, routineExerciseId }) => {
      // Append the set to its slot in the cached list right away so the new
      // row shows up without a round trip, then refetch to stay in sync.
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
            ? { ...item, sets: [...item.sets, created] }
            : item,
        ),
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.routines.exercises(routineId),
      });
    },
  });
};
