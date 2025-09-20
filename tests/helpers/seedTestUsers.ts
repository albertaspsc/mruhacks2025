import { createClient } from "@supabase/supabase-js";

// Create Supabase client function to ensure env vars are loaded
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: "participant" | "admin" | "volunteer";
  emailConfirmed?: boolean;
}

export const testUsers: TestUser[] = [
  {
    email: "test1@test.com",
    password: "Password123!",
    firstName: "test",
    lastName: "test",
    userType: "participant",
    emailConfirmed: true,
  },
  {
    email: "admin@test.com",
    password: "AdminPassword123!",
    firstName: "admin",
    lastName: "user",
    userType: "admin",
    emailConfirmed: true,
  },
  {
    email: "volunteer@test.com",
    password: "VolunteerPassword123!",
    firstName: "volunteer",
    lastName: "user",
    userType: "volunteer",
    emailConfirmed: true,
  },
  {
    email: "unconfirmed@test.com",
    password: "UnconfirmedPassword123!",
    firstName: "unconfirmed",
    lastName: "user",
    userType: "participant",
    emailConfirmed: false,
  },
  {
    email: "newuser@test.com",
    password: "NewUserPassword123!",
    firstName: "new",
    lastName: "user",
    userType: "participant",
    emailConfirmed: true,
  },
];

export async function seedTestUsers() {
  console.log("🌱 Seeding test users...");

  const supabase = getSupabaseClient();

  for (const user of testUsers) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(
        (u) => u.email === user.email,
      );

      if (existingUser) {
        console.log(`⚠️  User ${user.email} already exists, skipping...`);
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: user.emailConfirmed,
          user_metadata: {
            first_name: user.firstName,
            last_name: user.lastName,
          },
        });

      if (authError) {
        console.error(
          `❌ Failed to create auth user ${user.email}:`,
          authError,
        );
        continue;
      }

      console.log(`✅ Created auth user: ${user.email}`);

      // Create public.users record for participants
      if (user.userType === "participant") {
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          f_name: user.firstName,
          l_name: user.lastName,
          email: user.email,
          gender: 1, // Male
          university: 1, // Mount Royal University
          prev_attendance: false,
          major: 1, // Computer Science
          parking: "No",
          yearOfStudy: "2nd",
          experience: 1, // Beginner
          accommodations: "None",
          marketing: 1, // Poster
          status: "confirmed",
          checked_in: false,
        });

        if (userError) {
          console.error(
            `❌ Failed to create public user ${user.email}:`,
            userError,
          );
        } else {
          console.log(`✅ Created public user: ${user.email}`);
        }

        // Create marketing preferences
        const { error: mktgError } = await supabase
          .from("mktg_preferences")
          .insert({
            id: authData.user.id,
            send_emails: true,
          });

        if (mktgError) {
          console.error(
            `❌ Failed to create marketing preferences for ${user.email}:`,
            mktgError,
          );
        }
      }

      // Create admin record for admin/volunteer users
      if (user.userType === "admin" || user.userType === "volunteer") {
        const { error: adminError } = await supabase.from("admins").insert({
          id: authData.user.id,
          email: user.email,
          f_name: user.firstName,
          l_name: user.lastName,
          role: user.userType === "admin" ? "admin" : "volunteer",
          status: "active",
        });

        if (adminError) {
          console.error(
            `❌ Failed to create admin user ${user.email}:`,
            adminError,
          );
        } else {
          console.log(`✅ Created admin user: ${user.email}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error creating user ${user.email}:`, error);
    }
  }

  console.log("🎉 Test user seeding complete!");
}

export async function cleanupTestUsers() {
  console.log("🧹 Cleaning up test users...");

  const supabase = getSupabaseClient();

  for (const user of testUsers) {
    try {
      // Get user by email
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const testUser = authUsers.users.find((u) => u.email === user.email);

      if (testUser) {
        // Delete from auth.users (cascades to public.users and admins)
        const { error } = await supabase.auth.admin.deleteUser(testUser.id);

        if (error) {
          console.error(`❌ Failed to delete user ${user.email}:`, error);
        } else {
          console.log(`✅ Deleted user: ${user.email}`);
        }
      } else {
        console.log(`⚠️  User ${user.email} not found, skipping deletion...`);
      }
    } catch (error) {
      console.error(`❌ Error deleting user ${user.email}:`, error);
    }
  }

  console.log("🎉 Test user cleanup complete!");
}

export async function resetTestDatabase() {
  console.log("🔄 Resetting test database...");

  const supabase = getSupabaseClient();

  try {
    // Clean up test users first
    await cleanupTestUsers();

    // Clear any remaining test data
    const { error: workshopRegError } = await supabase
      .from("workshop_registrations")
      .delete()
      .like("user_id", "%test%");

    if (workshopRegError) {
      console.error(
        "❌ Failed to clear workshop registrations:",
        workshopRegError,
      );
    }

    const { error: userInterestsError } = await supabase
      .from("user_interests")
      .delete()
      .like("id", "%test%");

    if (userInterestsError) {
      console.error("❌ Failed to clear user interests:", userInterestsError);
    }

    const { error: userDietError } = await supabase
      .from("user_diet_restrictions")
      .delete()
      .like("id", "%test%");

    if (userDietError) {
      console.error(
        "❌ Failed to clear user diet restrictions:",
        userDietError,
      );
    }

    console.log("✅ Test database reset complete!");
  } catch (error) {
    console.error("❌ Error resetting test database:", error);
  }
}

// Utility function to get test user credentials
export function getTestUserCredentials(
  userType: "participant" | "admin" | "volunteer" = "participant",
) {
  const user = testUsers.find((u) => u.userType === userType);
  if (!user) {
    throw new Error(`No test user found for type: ${userType}`);
  }
  return {
    email: user.email,
    password: user.password,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

// Utility function to check if test users exist
export async function checkTestUsersExist(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const testEmails = testUsers.map((u) => u.email);
    const existingTestUsers = authUsers.users.filter((u) =>
      testEmails.includes(u.email!),
    );
    return existingTestUsers.length === testUsers.length;
  } catch (error) {
    console.error("❌ Error checking test users:", error);
    return false;
  }
}
