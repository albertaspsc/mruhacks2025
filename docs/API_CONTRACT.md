Account Creation:
POST /api/auth/create-account

- Purpose: Create basic user account (first screen)
- Request: { email, password, firstName, lastName }
- Response: {
  userId: string,
  token: string,
  message: "Account made successfully"
  }
- Status Codes: 201 (Created), 400(Bad Request), 409 (Conflict- Email exists)

Registration Completion:
POST /api/registration/complete-account

- Purpose: Complete hackathon registration (second screen)
- Headers: Authorization: Bearer{token}
- Request: {
  // Profile details
  dateOfBirth: date, // format: YYYY-MM-DD
  gender: string // Options: Female, Male, Non-binary, Prefer not to say
  school: string, // Would probably need an additional API file if you want to do the autocomplete functionality
  yearOfStudy: int,
  dietaryRestrictions: string[] (Vegetarian, Vegan, Kosher, Halal, Gluten Free, Other(string)),

  // Hackathon info
  skillset: string[],
  experience: string, // Level of Programming (Beginner, intermediate, Expert)  
  }

- Response: {
  registrationId: string,
  registrationStatus: "pending",
  message: "Registration submitted successfully"
  }
- Status Codes: 201 (Created), 400 (Bad Request), 401(Unauthorized)

POST /api/auth/login

- Purpose: Authenticate user
- Request: { email, password }
- Response: { userId, token, role }
- Status Codes: 200 (OK), 401 (Unauthorized)
