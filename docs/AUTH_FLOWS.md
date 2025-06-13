# Authentication Flows

## Email-Based Authentication

### Sign Up Flow

1. **`/login`**

   - User enters an email and password.
   - If account doesn't exist, Supabase attempts to sign the user up.
   - On success, user is redirected to `/auth/confirm`.

2. **`/auth/confirm?email=<user_email>`**

   - Instructs the user to check their email for a confirmation link.
   - A timeout may show a "resend" option after a few seconds.

3. **Email**

   - The user receives an email with a magic link (via Supabase) containing a token and type.

4. **`/auth/confirm?token_hash=...&type=signup&email=...`**

   - The app reads the token and type from the URL.
   - Calls `supabase.auth.verifyOtp()`.
   - On success: redirects to `/register`.

5. **`/register` ... `/dashboard`**

   - Final step after registration.
   - The app stores additional user metadata and/or determines whether to redirect to dashboard or onboarding.

---

### Login Flow

1. **`/login`**

   - User enters their credentials.
   - If correct, redirects to `/register`.
   - If incorrect, attempts sign-up.
   - If both fail, redirects to `/error`.

2. **`/register` ... `/dashboard`**

   - Same final destination as sign-up.
   - May include logic to verify registration status or onboard new users.

---

### Password Reset Flow

1. **`/auth/reset-password`**

   - User enters their email to request a password reset.
   - Supabase sends a password reset email.

2. **Email**

   - User clicks the link in the email, which redirects them back into the app with a token.

3. **`/auth/reset-password?code=...`**

   - The token is used to confirm the user’s identity.
   - After a successful reset, user is redirected to `/register`.

---

### Email Change Flow

1. **`/auth/change-email`**

   - **Authenticated user** submits old and new emails.
   - The server checks that the old email matches the current user's.
   - If valid, updates the user's email using `supabase.auth.updateUser()`.
   - If user isn't authenticated, redirects to `/login`

2. **`/register` -> `/dashboard`**

   - Redirected after success.
   - Optionally, re-authentication may be required.

---

## OAuth Provider Authentication (Google)

### Sign Up / Login with Google

1. **`/login`**

   - Initiates Supabase OAuth sign-in via Google.
   - Redirects the user to Google for authentication.

2. **`/auth/callback?code=...&next=/register`**

   - Google Auth redirects to callback url
   - Supabase exchanges the `code` for a session using `exchangeCodeForSession()`.
   - On success, user is redirected to `/register`.

3. **`/register` ... `/dashboard`**

   - Post-login flow is identical to email-based login.
   - Additional onboarding or user data setup may occur.

---

## Notes

- Most authentication errors redirect to `/error`, as per TODOs (`github issue #70`).
- `/register` acts as the gateway after authentication, handling user setup and conditional routing.
- All Supabase session and auth logic is securely handled using server actions or the Supabase client on the server.
