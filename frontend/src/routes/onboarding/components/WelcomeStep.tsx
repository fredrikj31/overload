import { Button } from "@shadcn-ui/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@shadcn-ui/components/ui/card";

interface WelcomeStepProps {
  name: string | undefined;
  onContinue: () => void;
}

export const WelcomeStep = ({ name, onContinue }: WelcomeStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome, {name ?? "there"}</CardTitle>
        <CardDescription>
          Before you start, a couple of quick questions so Overload matches how
          you train. It only takes a moment.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full" onClick={onContinue} autoFocus>
          Get started
        </Button>
      </CardFooter>
    </Card>
  );
};
