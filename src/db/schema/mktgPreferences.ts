import { pgTable, uuid, boolean, foreignKey } from "drizzle-orm/pg-core";
import { users } from "./users";

export const mktgPreferences = pgTable(
  "mktg_preferences",
  {
    id: uuid().primaryKey().notNull(),
    sendEmails: boolean("send_emails").default(true).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "mktg_preferences_id_users_id_fk",
    }),
  ],
);
