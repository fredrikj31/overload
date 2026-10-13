import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@shadcn-ui/components/ui/button";

type QueryErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export const QueryErrorState = ({ message, onRetry }: QueryErrorStateProps) => {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border p-8 text-center text-sm text-muted-foreground">
      <AlertCircle className="size-6" />
      <p>{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw /> Retry
      </Button>
    </div>
  );
};
