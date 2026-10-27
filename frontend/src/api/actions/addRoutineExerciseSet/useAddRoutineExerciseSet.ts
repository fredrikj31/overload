import { useMutation, useQueryClient } from "@tanstack/react-query";
import { routineExercisesQueryKey } from "../../queries/routines/listRoutineExercises/useListRoutineExercises";
import * as bodyPartSchema from "../../../types/bodyPart";
import * as equipmentSchema from "../../../types/equipment";
import * as exerciseSchema from "../../../types/exercise";
import * as routineExerciseSchema from "../../../types/routineExercise";
import * as routineExerciseSetSchema from "../../../types/routineExerciseSet";
import { addRoutineExerciseSet } from "./addRoutineExerciseSet";

interface AddRoutineExerciseSetVariables {
  routineId: string;
  routineExerciseId: string;
  body: Pick<routineExerciseSetSchema.RoutineExerciseSet, "reps"> &
    Partial<
      Pick<
        routineExerciseSetSchema.RoutineExerciseSet,
        "type" | "weightUnit" | "weight"
      >
    >;
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
      >(routineExercisesQueryKey(routineId), (items) =>
        items?.map((item) =>
          item.id === routineExerciseId
            ? { ...item, sets: [...item.sets, created] }
            : item,
        ),
      );
      void queryClient.invalidateQueries({
        queryKey: routineExercisesQueryKey(routineId),
      });
    },
  });
};
