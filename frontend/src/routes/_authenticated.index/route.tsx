import { Button } from "@shadcn-ui/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "../../providers/auth";

export const IndexRoute = () => {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col">
      <h1>Index Page</h1>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => logout()}
      >
        <LogOut /> Log out
      </Button>
    </div>
  );
};
