# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

Overload is an open-source **workout tracker**, built as a **PWA** that people
install on their phone and use mid-workout (`frontend/public/manifest.webmanifest`
sets `display: standalone` and `orientation: portrait`). Phones are the primary
target. Desktop is secondary but every screen must still work there.

Domain today: exercises (seeded from a public dataset), muscles / body parts /
equipment, user-owned **routines** (templates) with ordered exercises and
planned sets, user preferences (`weight_unit`: `kg` | `lb`), and **workouts**
(`workout` -> `workout_exercise` -> `workout_exercise_set`), which log a
session either started from a routine (`routine_id` set, sets pre-filled from
the routine) or started empty. Routine sets are prescriptions; workout sets
are logs (`completed_at` null until performed, `ended_at` null while the
workout is in progress). The only workout route today is `POST /workouts`
(start an empty workout; 409 while one is in progress); there is no workout
UI yet. `docs/database.md` holds the ERD and schema notes.

## Repo layout and commands

pnpm monorepo, Node >= 24 (`.nvmrc`), pnpm 12, ESM everywhere. Packages:
`@overload/frontend` (React 19 + Vite 8), `@overload/backend` (Fastify 5),
`@overload/database` (Drizzle schemas + migrations), `@overload/seeder`.
Each package compiles with TypeScript 7; the root `typescript@6` exists only
for typescript-eslint.

Always use the root scripts in `package.json`:

| Task                   | Command                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| Run dev servers        | `pnpm frontend:dev`, `pnpm backend:dev`                                        |
| Type-check a package   | `pnpm <pkg>:build:check`                                                       |
| Lint / format          | `pnpm <pkg>:lint`, `pnpm lint:check`, `pnpm format:write`, `pnpm format:check` |
| Schema change          | `pnpm database:generate`, `pnpm database:migrate`, `pnpm database:build`       |
| Regenerate auth schema | `pnpm backend:auth:generate`                                                   |
| Seed exercises + media | `pnpm seeder:run`                                                              |

- **Injected workspace package:** `@overload/database` is _copied_ into backend
  and seeder (`injectWorkspacePackages: true` in `pnpm-workspace.yaml`). After
  any change under `database/src`, run `pnpm database:build` or the backend
  will not see it. `backend:dev` and the `*:build:check` scripts already do this.
- Local infra: `docker compose --profile dev up` starts Postgres 18
  (`dev-database`, port 5432) and the media nginx (`dev-media`, port 5003).
  Backend and frontend run on the host.
- One `.env` at the repo root (see `.env.example`). Packages load `../.env`, so
  run things through the pnpm scripts, not from arbitrary directories. Add new
  variables to `.env.example` and to the Zod config (`backend/src/config.ts`,
  `frontend/src/config.ts`, `seeder/src/config.ts`).
- API docs: Scalar UI at `/docs`, OpenAPI at `/api/docs/json` (not used for codegen).

## Definition of done

There is **no test suite and CI runs no checks** (only semantic-release and
Docker builds on push to `main`). The pre-commit hook runs `prettier --check`
and `eslint` **without `--fix`**, so unformatted files fail the commit.

Before reporting a task done:

1. Run `pnpm <pkg>:build:check` and `pnpm <pkg>:lint` for every touched package.
2. Run `pnpm format:write`, then `pnpm format:check`.
3. Report the real output. Never claim a check passed if it was not run.
4. For frontend UI changes it is recommended (not required) to start
   `pnpm frontend:dev` and look at the change in a browser at roughly 390px wide
   and at >= 1024px, in **both dark and light** theme. Say whether you did.
5. For schema changes: generate the migration, update `docs/database.md` (ERD
   and notes), and update the mirrored type in `frontend/src/types/`.

## Frontend

### Mobile first, desktop capable

- Design for a 360–430px portrait phone first, then make it good at `md:` and
  up. Tailwind breakpoints are mobile-first; `md:` is the desktop breakpoint in
  this codebase, `lg:` is used for wider grids.
- Reuse the app shell in `frontend/src/routes/_authenticated/route.tsx`: an
  `h-dvh` flex column with `AppHeader` (desktop nav is `hidden md:flex`), a
  scrollable `<main>`, and `BottomNav` (`md:hidden`, padded with
  `pb-[env(safe-area-inset-bottom)]`). New top-level destinations go in
  `frontend/src/components/navItems.ts`; both navs read it.
- Page container: `mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-8 md:p-6`
  (`max-w-3xl` on detail pages). Page header: `h1` with
  `text-2xl font-semibold tracking-tight` plus a `text-sm text-muted-foreground`
  paragraph.
- Touch targets of at least 44px. Use `inputMode="decimal"` / `"numeric"` for
  number entry. No hover-only affordances. No horizontal page scroll. Use
  `h-dvh` / `min-h-svh`, never `100vh`. Respect safe-area insets on anything
  pinned to the bottom (`viewport-fit=cover` is set in `index.html`).
- Dialogs use shadcn `Dialog` / `AlertDialog`; they are full-width on phones and
  widened with `sm:max-w-*`. Keep a dialog open while its mutation is pending.

### Colours and theming (strict)

- Use **only the shadcn semantic tokens** defined in `frontend/src/index.css`:
  `background` / `foreground`, `card`, `popover`, `primary`, `secondary`,
  `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1..5`,
  `sidebar-*`, each via Tailwind utilities (`bg-card`, `text-muted-foreground`,
  `border-border`, `text-destructive`, ...).
- **Never** use Tailwind palette colours (`bg-blue-500`, `text-red-600`, ...),
  arbitrary values (`bg-[#...]`, `oklch(...)`, `rgb(...)`), or new colour CSS
  variables. Do not edit the `:root` / `.dark` values to fix one component.
- The palette is stock shadcn **`neutral`** (`frontend/components.json`:
  `baseColor: "neutral"`, `style: "base-nova"`): greys only, with
  `destructive` as the single accent. Keep that look.
- Everything must look right in both themes. **Dark is the default**
  (`ThemeProvider defaultTheme="dark"` in `frontend/src/App.tsx`). The theme
  provider is the custom one in `frontend/src/providers/theme.tsx`, **not**
  next-themes. If theme colours ever change, keep the pre-paint script in
  `frontend/index.html`, `THEME_COLOR` in `theme.tsx` and `theme_color` in the
  manifest in sync.
- **Known debt, do not copy:**
  `frontend/src/routes/_authenticated.routines.$id/components/setTypes.ts`
  uses amber / red / violet palette classes for set-type markers. Migrate it to
  tokens in a dedicated task; do not add further exceptions.
- Icons: `lucide-react` only. Font: Geist, already global. Radii come from
  `--radius` (`rounded-md`, `rounded-lg`, ...); do not hardcode `rounded-[...]`.

### shadcn usage

- Components are vendored in `frontend/src/shadcn-ui/components/ui/` and are
  ESLint-ignored. Add new ones with the CLI from `frontend/`:
  `pnpm dlx shadcn@latest add <name>`, committed as
  `chore(frontend): installs shadcn "<name>" component`. Do not hand-write a
  component shadcn already provides, and do not edit vendored files without a
  deliberate, commented reason.
- Import from `@shadcn-ui/components/ui/<name>`; `cn` comes from
  `@shadcn-ui/lib/utils`. Primitives are **Base UI**, so compose with the
  `render` prop (`<DialogTrigger render={<Button />}>`), not Radix `asChild`.
  Links that look like buttons use `buttonVariants`.
- Installed: alert-dialog, avatar, badge, button, card, dialog, dropdown-menu,
  field, input-group, input, label, progress, questionnaire, select, separator,
  skeleton, sonner, textarea.

### Code conventions

- **Routing:** declarative React Router v8 in `frontend/src/App.tsx`. One folder
  per route under `frontend/src/routes/<name>/route.tsx`, exporting `XxxRoute`;
  route-private components in `routes/<name>/components/`. Authenticated
  routes live under `_authenticated.*`. The layout also enforces the
  onboarding gate: a 404 with code `user-preference-not-found` redirects to
  `/onboarding`.
- **Data:** axios client in `frontend/src/api/client.ts` (cookie auth, errors
  mapped to `ApiError`). One folder per operation:
  `api/<domain>/<op>/<op>.ts` is the request function and zod-parses the
  `{ data }` envelope; `use<Op>.ts` is the TanStack Query hook
  (`queryOptions` for reads; `useMutation` plus invalidate or `setQueryData`
  for writes). Query keys live only in `api/queryKeys.ts`.
- **Types:** `frontend/src/types/<entity>.ts` hand-mirrors
  `database/src/schemas/*.ts`; there is no shared package. When a schema
  changes, update the mirror, including the user-facing zod messages.
- **Forms:** no react-hook-form. Controlled state, `<form noValidate>`, zod
  `safeParse` against the entity schema, and shadcn `Field` / `FieldLabel` /
  `FieldError`. Toasts via `sonner` with `position: "bottom-right"`; query
  errors also render inline with `QueryErrorState`.
- **Style:** named exports only, arrow components, `type XxxProps`, PascalCase
  component files, `useXxx.ts` hooks, no barrel files, relative imports (the
  only alias is `@shadcn-ui`). Read env through `frontend/src/config.ts` only.

## Backend

- Fastify 5 with `fastify-type-provider-zod`. Three layers, all plain functions:
  1. **Route** `backend/src/routes/<resource>/index.ts`: Zod `params`, `body`
     and per-status `response` schemas, `security: [{ session: [] }]`,
     `onRequest: validateSession()`.
  2. **Handler** `routes/<resource>/handlers/<verbNoun>.ts`: `userId` guard,
     ownership checks, throws domain errors.
  3. **Query** `services/database/queries/<entity>/<verbEntity>.ts`: one Drizzle
     query per file, ending in `.catch` that logs and throws
     `InternalServerError` with a kebab-case `code`.
- Success responses are `{ data: ... }`; 201 on create, 204 on delete. Errors
  come from `backend/src/errors/*` with kebab-case codes. Resources owned by
  another user return 404, never 403, so existence is not leaked.
- Always filter `deletedAt: { isNull: true }`; deletes are soft. `position`
  columns are `max + 1`, non-unique, gaps allowed.
- Request and response schemas derive from the database package's drizzle-zod
  schemas with `.pick` / `.partial` / `.extend`.
- `database/src/schemas/auth.ts` is **generated** by
  `pnpm backend:auth:generate`. Never hand-edit it.

## Database

- One file per table in `database/src/schemas/`. SQL names are singular
  snake_case, TS identifiers camelCase. Standard columns: `id` as
  `uuid().defaultRandom()`, `createdAt`, `updatedAt` with `$onUpdate`, and
  `deletedAt` for soft delete (exceptions: the auth tables and
  `user_preference`). Enums are `const X = [...] as const` plus `pgEnum`. Each
  file ends with the shared Zod block (`createSelectSchema` with refinements;
  `z.uuid()` for uuids, `z.int()` for ints because drizzle-zod 0.8 cannot
  infer them).
- Workflow: edit schema, `pnpm database:generate`, review the SQL in
  `database/src/migrations/<timestamp>_<name>/`, `pnpm database:migrate`,
  `pnpm database:build`, then update `docs/database.md` and the frontend
  mirror. Never edit an existing migration.

## Git

- Conventional Commits, lowercase, with a scope and a **third-person present
  verb**: `feat(frontend): adds ...`, `fix(backend): fixes ...`,
  `chore(pnpm): ...`, `docs(database): ...`, `ci(workflows): ...`. Scopes in
  use: frontend, backend, database, seeder, docker, docker-compose, project,
  workflows, pnpm, package.json. semantic-release cuts releases from these
  messages, so pick the type carefully.
- Branches are `<issue-number>-<kebab-issue-title>` (GitHub "create branch
  from issue"). PRs are merged with merge commits, so every commit message counts.
- Do not commit unless asked. Run `pnpm format:write` first; the hook only checks.

## How to approach a task

- Read the closest existing route, handler or component and copy its pattern.
  The codebase is small and consistent.
- For a feature that touches data, work database -> backend -> frontend
  mirror type -> API function + hook -> UI, type-checking each layer as you go.
- Keep changes scoped. Do not refactor unrelated code or fix the known issues
  below unless asked. Mention them if they affect the task.
- Keep docs in sync: `docs/database.md` for schema, `.env.example` for env vars.

## Known issues (leave alone unless asked)

- Set-type marker colours use palette classes (see the colour rule).
- `shadcn-ui/components/ui/sonner.tsx` reads the theme from next-themes, which
  has no provider, so the Toaster ignores the app theme.
- `components/navItems.ts` links to `/profile`, which has no route.
- `QueryClient` is constructed inside the `App` component body.
- The dashboard (`routes/_authenticated.index/mock.ts`) renders mock data.
- `addRoutineExerciseSet` hardcodes `weightUnit ?? "kg"` instead of the user's
  preference (there is a TODO in the handler).
- `docs/database.md` says a missing `user_preference` row means defaults, but
  the API returns 404 and onboarding creates the row.
