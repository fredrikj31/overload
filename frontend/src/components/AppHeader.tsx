import { Dumbbell } from "lucide-react";
import { Link, NavLink } from "react-router";
import { cn } from "@shadcn-ui/lib/utils";
import { ModeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { navItems } from "./navItems";

export const AppHeader = () => {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link to="/" className="flex items-center gap-2 font-medium">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Dumbbell className="size-4" />
        </div>
        Overload
      </Link>
      <nav className="hidden items-center gap-1 md:flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted",
                isActive ? "bg-muted text-foreground" : "text-muted-foreground",
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
        <UserMenu />
      </div>
    </header>
  );
};
