import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shadcn-ui/components/ui/card";
import { config } from "../../config";

const REPOSITORY_URL = "https://github.com/fredrikj31/overload";

// The version is injected at build time by the release workflow, so a user can
// tell whether their (possibly cached) PWA is running the latest release.
const formatVersion = (version: string): string =>
  version === "dev" ? version : `v${version}`;

export const AboutRoute = () => {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-8 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">About</h1>
        <p className="text-sm text-muted-foreground">
          Overload is a workout tracker for building routines and logging
          progressive overload.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Version</CardTitle>
          <CardDescription>
            The release this app was built from. If it looks out of date, close
            and reopen the app to pick up the latest version.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-lg" data-testid="app-version">
            {formatVersion(config.app.version)}
          </p>
        </CardContent>
      </Card>

      <a
        href={REPOSITORY_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Source code on GitHub <ExternalLink className="size-3.5" />
      </a>
    </div>
  );
};
