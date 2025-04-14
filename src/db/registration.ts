import { createInsertSchema } from "drizzle-zod";
import { users } from "./schema";
import { z } from "zod";
import { createClient } from "../../utils/supabase/server";
import { db } from "./drizzle";
import { and, eq, isNotNull } from "drizzle-orm";

export async function isRegistered() {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  const data = await db
    .select()
    .from(users)
    .where(and(eq(users.id, auth.user.id), isNotNull(users.timestamp)));

  return { data: data.length == 1 };
}

const registrationSchema = createInsertSchema(users).omit({ id: true });
type RegistrationSchema = z.infer<typeof registrationSchema>;

export async function register(registration: RegistrationSchema) {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return;
  }

  console.log(auth.user);
  const { data: registrationData, error: registrationError } =
    registrationSchema.safeParse(registration);
  if (registrationError) {
    return;
  }

  const fullRegistration = registrationData as typeof registrationData & {
    id: string;
  };
  fullRegistration.id = auth.user.id;
  //   await db.insert(users).values(fullRegistration);

  return;
}
