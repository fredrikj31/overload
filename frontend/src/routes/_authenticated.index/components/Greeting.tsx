import { useAuth } from "../../../providers/auth";

export const Greeting = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back, {user?.name ?? "there"}
      </h1>
      <p className="text-sm text-muted-foreground">
        Here&apos;s your week at a glance.
      </p>
    </div>
  );
};
