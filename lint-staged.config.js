export default {
  "*": () => ["pnpm run format:check"],
  "*.{ts,tsx,js,mjs,cjs}": () => ["pnpm run lint:check"],
};
