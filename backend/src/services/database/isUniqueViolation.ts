/**
 * True when a query failed on a UNIQUE / PRIMARY KEY constraint.
 *
 * drizzle-orm wraps the `pg` DatabaseError in a DrizzleQueryError, so the
 * Postgres SQLSTATE usually lives on `error.cause`; the bare error is checked
 * too in case a driver error reaches us unwrapped.
 */
export const isUniqueViolation = (error: unknown): boolean => {
  const code = (e: unknown): unknown =>
    typeof e === "object" && e !== null && "code" in e ? e.code : undefined;

  return (
    code(error) === "23505" ||
    (error instanceof Error && code(error.cause) === "23505")
  );
};
