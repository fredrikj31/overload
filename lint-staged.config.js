export default {
  // Prettier: all staged files. --ignore-unknown skips files prettier has no
  // parser for (.nvmrc, Dockerfile.*, .env, ...) instead of erroring.
  // .prettierignore is still honoured for explicitly passed paths.
  "*": "prettier --check --ignore-unknown",

  // ESLint: staged JS/TS only. --no-warn-ignored suppresses the "file ignored"
  // warning for paths matched by globalIgnores (e.g. database/src/schemas/auth.ts,
  // frontend/src/shadcn-ui/) when they are passed explicitly.
  "*.{ts,tsx,js,mjs,cjs}": "eslint --no-warn-ignored",
};
