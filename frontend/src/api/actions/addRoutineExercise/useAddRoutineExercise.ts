import { useMutation } from "@tanstack/react-query";
import { addRoutineExercise } from "./addRoutineExercise";

interface AddRoutineExerciseVariables {
  routineId: string;
  exerciseId: string;
}

export const useAddRoutineExercise = () => {
  return useMutation({
    mutationFn: ({ routineId, exerciseId }: AddRoutineExerciseVariables) => {
      return addRoutineExercise(routineId, { exerciseId });
    },
    // Nothing caches a routine's exercises yet. Once a query for them exists,
    // invalidate it here on success.
  });
};
