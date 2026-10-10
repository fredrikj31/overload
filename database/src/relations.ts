import { defineRelations } from "drizzle-orm";
import * as authSchema from "./schemas/auth";
import { bodyPart } from "./schemas/bodyPart";
import { muscle } from "./schemas/muscle";

export const relations = defineRelations(
  { ...authSchema, bodyPart, muscle },
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
    bodyPart: {
      muscles: r.many.muscle(),
    },
    muscle: {
      bodyPart: r.one.bodyPart({
        from: r.muscle.bodyPartId,
        to: r.bodyPart.id,
      }),
    },
  }),
);
