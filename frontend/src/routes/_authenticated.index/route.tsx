import { Greeting } from "./components/Greeting";
import { StatsGrid } from "./components/StatsGrid";
import { NextWorkoutCard } from "./components/NextWorkoutCard";
import { WeeklyActivityCard } from "./components/WeeklyActivityCard";
import { RecentWorkoutsCard } from "./components/RecentWorkoutsCard";
import { MusclesTrainedCard } from "./components/MusclesTrainedCard";
import {
  musclesTrained,
  nextWorkout,
  recentWorkouts,
  stats,
  weekDays,
} from "./mock";

export const IndexRoute = () => {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-8 md:p-6">
      <Greeting />
      <StatsGrid stats={stats} />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <NextWorkoutCard workout={nextWorkout} />
        <WeeklyActivityCard days={weekDays} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <RecentWorkoutsCard workouts={recentWorkouts} />
        <MusclesTrainedCard muscles={musclesTrained} />
      </div>
    </div>
  );
};
