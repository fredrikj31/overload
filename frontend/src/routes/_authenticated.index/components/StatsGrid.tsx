import { Clock, Dumbbell, Flame, Weight, type LucideIcon } from "lucide-react";
import type { Stat } from "../mock";
import { StatTile } from "./StatTile";

const iconByStat: Record<Stat["id"], LucideIcon> = {
  workouts: Dumbbell,
  streak: Flame,
  volume: Weight,
  time: Clock,
};

type StatsGridProps = {
  stats: Stat[];
};

export const StatsGrid = ({ stats }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <StatTile
          key={stat.id}
          label={stat.label}
          value={stat.value}
          hint={stat.hint}
          icon={iconByStat[stat.id]}
        />
      ))}
    </div>
  );
};
