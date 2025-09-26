import { login } from "@/app/login/actions";
import { createClient } from "@/utils/supabase/server";
import { getRegistrationDataAction } from "@/actions/registrationActions";

// Mock dependencies
jest.mock("@/utils/supabase/server");
jest.mock("@/actions/registrationActions");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockGetRegistrationDataAction =
  getRegistrationDataAction as jest.MockedFunction<
    typeof getRegistrationDataAction
  >;

// Test data factory
const createLoginFormData = (
  overrides: { email?: string; password?: string } = {},
) => {
  const formData = new FormData();
  formData.append("email", overrides.email ?? "test@example.com");
  formData.append("password", overrides.password ?? "password123");
  return formData;
};

describe("Login Actions", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
        signInWithOAuth: jest.fn().mockResolvedValue({
          data: { url: null },
          error: null,
        }),
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user123" } },
          error: null,
        }),
      },
    };
    mockCreateClient.mockResolvedValue(mockSupabase);
    mockGetRegistrationDataAction.mockResolvedValue({
      success: true,
      data: null,
    });
  });

  describe("login function", () => {
    it("should successfully login with valid credentials", async () => {
      // Arrange
      const formData = createLoginFormData();

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: "user123" } },
        error: null,
      });

      mockGetRegistrationDataAction.mockResolvedValue({
        success: true,
        data: { id: "reg123" } as any,
      });

      // Act & Assert
      await expect(login(formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should throw error for invalid email format", async () => {
      // Arrange
      const formData = createLoginFormData({ email: "invalid-email" });

      // Act & Assert
      await expect(login(formData)).rejects.toThrow(
        "Please enter a valid email and password.",
      );
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should throw error for empty email", async () => {
      // Arrange
      const formData = createLoginFormData({ email: "" });

      // Act & Assert
      await expect(login(formData)).rejects.toThrow(
        "Please enter a valid email and password.",
      );
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should throw error for empty password", async () => {
      // Arrange
      const formData = createLoginFormData({ password: "" });

      // Act & Assert
      await expect(login(formData)).rejects.toThrow(
        "Please enter a valid email and password.",
      );
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should throw specific error for invalid credentials", async () => {
      // Arrange
      const formData = createLoginFormData({ password: "wrongpassword" });

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid login credentials" },
      });

      // Act & Assert
      await expect(login(formData)).rejects.toThrow(
        "Invalid credentials. Please check your email and password.",
      );
    });

    it("should throw specific error for unconfirmed email", async () => {
      // Arrange
      const formData = createLoginFormData();

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: "Email not confirmed" },
      });

      // Act & Assert
      await expect(login(formData)).rejects.toThrow(
        "Please verify your email before signing in.",
      );
    });

    it("should throw specific error for too many requests", async () => {
      // Arrange
      const formData = createLoginFormData();

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: "Too many requests" },
      });

      // Act & Assert
      await expect(login(formData)).rejects.toThrow(
        "Too many login attempts. Please try again later.",
      );
    });

    it("should throw generic error for unknown auth errors", async () => {
      // Arrange
      const formData = createLoginFormData();

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: "Unknown error" },
      });

      // Act & Assert
      await expect(login(formData)).rejects.toThrow(
        "Login failed. Please try again.",
      );
    });

    it("should redirect to user dashboard for existing user", async () => {
      // Arrange
      const formData = createLoginFormData();

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: "user123" } },
        error: null,
      });

      mockGetRegistrationDataAction.mockResolvedValue({
        success: true,
        data: { id: "reg123" } as any,
      });

      // Act & Assert
      await expect(login(formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(mockGetRegistrationDataAction).toHaveBeenCalled();
    });

    it("should redirect to registration for new user", async () => {
      // Arrange
      const formData = createLoginFormData();

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: "user123" } },
        error: null,
      });

      mockGetRegistrationDataAction.mockResolvedValue({
        success: true,
        data: null,
      });

      // Act & Assert
      await expect(login(formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(mockGetRegistrationDataAction).toHaveBeenCalled();
    });
  });
});
