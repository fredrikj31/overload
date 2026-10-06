import { defineRelations } from "drizzle-orm";
import * as authSchema from "./schemas/auth";
import * as exerciseSchema from "./schemas/exercise";

export const relations = defineRelations(
  { ...authSchema, ...exerciseSchema },
  (r) => ({
    user: {
      sessions: r.many.session(),
      accounts: r.many.account(),
    },
    session: {
      user: r.one.user({ from: r.session.userId, to: r.user.id }),
    },
    account: {
      user: r.one.user({ from: r.account.userId, to: r.user.id }),
    },
  }),
);
