import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import * as bodyPartSchema from "../../../types/bodyPart";
import * as equipmentSchema from "../../../types/equipment";
import * as exerciseSchema from "../../../types/exercise";
import * as routineExerciseSchema from "../../../types/routineExercise";
import * as routineExerciseSetSchema from "../../../types/routineExerciseSet";
import { updateRoutineExerciseSet } from "./updateRoutineExerciseSet";

interface UpdateRoutineExerciseSetVariables {
  routineId: string;
  routineExerciseId: string;
  setId: string;
  body: Partial<
    Pick<
      routineExerciseSetSchema.RoutineExerciseSet,
      "type" | "reps" | "weightUnit" | "weight"
    >
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
          routineExerciseSchema.RoutineExercise,
          "id" | "routineId" | "exerciseId" | "position"
        > & {
          exercise: Pick<
            exerciseSchema.Exercise,
            "id" | "name" | "imagePath"
          > & {
            bodyPart: Pick<
              bodyPartSchema.BodyPart,
              "id" | "name" | "slug"
            > | null;
            equipment: Pick<equipmentSchema.Equipment, "id" | "name" | "slug">;
          };
          sets: Pick<
            routineExerciseSetSchema.RoutineExerciseSet,
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
