import { defineRelations } from "drizzle-orm";
import * as authSchema from "./schemas/auth";
import { bodyPart } from "./schemas/bodyPart";
import { equipment } from "./schemas/equipment";
import { exercise } from "./schemas/exercise";
import { muscle } from "./schemas/muscle";

export const relations = defineRelations(
  { ...authSchema, bodyPart, muscle, equipment, exercise },
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
      exercises: r.many.exercise(),
    },
    muscle: {
      bodyPart: r.one.bodyPart({
        from: r.muscle.bodyPartId,
        to: r.bodyPart.id,
      }),
    },
    equipment: {
      exercises: r.many.exercise(),
    },
    exercise: {
      bodyPart: r.one.bodyPart({
        from: r.exercise.bodyPartId,
        to: r.bodyPart.id,
      }),
      equipment: r.one.equipment({
        from: r.exercise.equipmentId,
        to: r.equipment.id,
      }),
    },
  }),
);
