import {
  Dumbbell,
  House,
  ListChecks,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

export const navItems: readonly NavItem[] = [
  { to: "/", label: "Home", icon: House, end: true },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/exercises", label: "Exercises", icon: ListChecks },
  { to: "/profile", label: "Profile", icon: User },
];
