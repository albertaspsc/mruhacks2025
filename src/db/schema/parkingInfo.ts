import { pgTable, uuid, varchar, foreignKey } from "drizzle-orm/pg-core";
import { users } from "./users";

export const parkingInfo = pgTable(
  "parking_info",
  {
    id: uuid().primaryKey().notNull(),
    licensePlate: varchar("license_plate", { length: 8 }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "parking_info_id_users_id_fk",
    }),
  ],
);
