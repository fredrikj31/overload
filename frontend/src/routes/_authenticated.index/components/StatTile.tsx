import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@shadcn-ui/components/ui/card";

type StatTileProps = {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
};

export const StatTile = ({ label, value, hint, icon: Icon }: StatTileProps) => {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <Icon className="size-4" />
        </div>
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </CardContent>
    </Card>
  );
};
