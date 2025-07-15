// /app/api/auth/admin-login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { createClient } from "../../../../utils/supabase/client";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const supabase = createClient();

    // Get admin account from custom table
    const { data: adminAccount, error } = await supabase
      .from("admin_accounts")
      .select("id, email, password_hash, role, status")
      .eq("email", email)
      .single();

    if (error || !adminAccount) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Check if account is active
    if (adminAccount.status !== "active") {
      return NextResponse.json(
        { error: "Account is inactive" },
        { status: 401 },
      );
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(
      password,
      adminAccount.password_hash,
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Create JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({
      id: adminAccount.id,
      email: adminAccount.email,
      role: adminAccount.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(secret);

    // Set secure cookie
    const response = NextResponse.json({
      success: true,
      role: adminAccount.role,
      message: `Logged in as ${adminAccount.role}`,
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
