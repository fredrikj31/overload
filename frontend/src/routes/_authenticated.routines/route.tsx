import { CreateRoutineDialog } from "./components/CreateRoutineDialog";

export const RoutinesRoute = () => {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-8 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Routines</h1>
          <p className="text-sm text-muted-foreground">
            Build routines from your favourite exercises.
          </p>
        </div>
        <CreateRoutineDialog />
      </div>

      <div className="flex flex-col items-center gap-1 rounded-xl border p-8 text-center text-sm text-muted-foreground">
        <p>No routines yet.</p>
        <p>Create one with the plus button.</p>
      </div>
    </div>
  );
};
