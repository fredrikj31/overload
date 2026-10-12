export type Stat = {
  id: "workouts" | "streak" | "volume" | "time";
  label: string;
  value: string;
  hint: string;
};

export type PlannedExercise = {
  name: string;
  sets: number;
  reps: string;
};

export type PlannedWorkout = {
  name: string;
  estimatedMinutes: number;
  exercises: PlannedExercise[];
};

export type WorkoutSession = {
  id: string;
  name: string;
  date: string;
  durationMinutes: number;
  volumeKg: number;
  exerciseCount: number;
};

export type WeekDay = {
  label: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  trained: boolean;
  isToday: boolean;
};

export type MuscleSets = {
  muscle: string;
  sets: number;
};

export const stats: Stat[] = [
  { id: "workouts", label: "Workouts", value: "3", hint: "this week" },
  { id: "streak", label: "Streak", value: "5", hint: "weeks in a row" },
  { id: "volume", label: "Volume", value: "24,850 kg", hint: "this week" },
  { id: "time", label: "Time trained", value: "2h 45m", hint: "this week" },
];

export const nextWorkout: PlannedWorkout = {
  name: "Upper Body A",
  estimatedMinutes: 55,
  exercises: [
    { name: "Barbell Bench Press", sets: 4, reps: "6-8" },
    { name: "Pull-up", sets: 4, reps: "8" },
    { name: "Overhead Press", sets: 3, reps: "8-10" },
    { name: "Barbell Row", sets: 3, reps: "10" },
    { name: "Dumbbell Curl", sets: 3, reps: "12" },
    { name: "Triceps Pushdown", sets: 3, reps: "12" },
  ],
};

export const recentWorkouts: WorkoutSession[] = [
  {
    id: "1",
    name: "Lower Body B",
    date: "Yesterday",
    durationMinutes: 62,
    volumeKg: 11200,
    exerciseCount: 5,
  },
  {
    id: "2",
    name: "Upper Body B",
    date: "Wed, Oct 8",
    durationMinutes: 54,
    volumeKg: 7350,
    exerciseCount: 6,
  },
  {
    id: "3",
    name: "Lower Body A",
    date: "Mon, Oct 6",
    durationMinutes: 58,
    volumeKg: 10900,
    exerciseCount: 5,
  },
  {
    id: "4",
    name: "Upper Body A",
    date: "Sat, Oct 4",
    durationMinutes: 51,
    volumeKg: 6980,
    exerciseCount: 6,
  },
];

export const weekDays: WeekDay[] = [
  { label: "Mon", trained: true, isToday: false },
  { label: "Tue", trained: false, isToday: false },
  { label: "Wed", trained: true, isToday: false },
  { label: "Thu", trained: false, isToday: false },
  { label: "Fri", trained: true, isToday: false },
  { label: "Sat", trained: false, isToday: true },
  { label: "Sun", trained: false, isToday: false },
];

export const musclesTrained: MuscleSets[] = [
  { muscle: "Quadriceps", sets: 14 },
  { muscle: "Pectorals", sets: 12 },
  { muscle: "Lats", sets: 10 },
  { muscle: "Hamstrings", sets: 9 },
  { muscle: "Deltoids", sets: 8 },
  { muscle: "Glutes", sets: 8 },
  { muscle: "Triceps", sets: 6 },
  { muscle: "Biceps", sets: 6 },
];
