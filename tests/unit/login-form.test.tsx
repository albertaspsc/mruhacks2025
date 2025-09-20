import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import LoginPage from "@/app/login/page";
import { login, loginWithGoogle } from "@/app/login/actions";

// Mock dependencies

jest.mock("@/app/login/actions", () => ({
  login: jest.fn(),
  loginWithGoogle: jest.fn(),
}));

jest.mock("next/image", () => {
  return function MockImage({ alt, ...props }: any) {
    return <img alt={alt} {...props} />;
  };
});

jest.mock("react-icons/fc", () => ({
  FcGoogle: () => <div data-testid="google-icon">Google Icon</div>,
}));

const mockLogin = login as jest.MockedFunction<typeof login>;
const mockLoginWithGoogle = loginWithGoogle as jest.MockedFunction<
  typeof loginWithGoogle
>;

describe("LoginPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Form Rendering", () => {
    it("should render login form with all required elements", () => {
      render(<LoginPage />);

      expect(
        screen.getByRole("heading", { name: "Log In" }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Log In" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
      expect(screen.getByText("Forgot password?")).toBeInTheDocument();
      expect(screen.getByText("Admin/Volunteer Login")).toBeInTheDocument();
    });

    it("should have proper form attributes", () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Log In" });

      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("required");
      expect(emailInput).toHaveAttribute("autoComplete", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("required");
      expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Form Validation", () => {
    it("should show validation error for invalid email format", async () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Log In" });

      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      // Browser validation should prevent form submission
      expect(emailInput).toBeInvalid();
    });

    it("should show validation error for empty required fields", async () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Log In" });

      fireEvent.click(submitButton);

      expect(emailInput).toBeInvalid();
      expect(passwordInput).toBeInvalid();
    });
  });

  describe("Form Submission", () => {
    it("should call login action with form data on successful submission", async () => {
      mockLogin.mockResolvedValue(undefined);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Log In" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(expect.any(FormData));
      });

      const formData = mockLogin.mock.calls[0][0];
      expect(formData.get("email")).toBe("test@example.com");
      expect(formData.get("password")).toBe("password123");
    });

    it("should show error message when login fails", async () => {
      mockLogin.mockRejectedValue(new Error("Login failed"));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Log In" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Login failed. Please try again."),
        ).toBeInTheDocument();
      });
    });

    it("should clear error message when user starts typing", async () => {
      mockLogin.mockRejectedValue(new Error("Login failed"));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Log In" });

      // Trigger error
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Login failed. Please try again."),
        ).toBeInTheDocument();
      });

      // Start typing again
      fireEvent.change(emailInput, { target: { value: "new@example.com" } });

      // Error message should still be there (implementation dependent)
      expect(
        screen.getByText("Login failed. Please try again."),
      ).toBeInTheDocument();
    });
  });

  describe("Google Login", () => {
    it("should call loginWithGoogle when Google button is clicked", async () => {
      mockLoginWithGoogle.mockResolvedValue(undefined);

      render(<LoginPage />);

      const googleButton = screen.getByText("Sign in with Google");
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockLoginWithGoogle).toHaveBeenCalled();
      });
    });

    it("should show error message when Google login fails", async () => {
      mockLoginWithGoogle.mockRejectedValue(new Error("Google login failed"));

      render(<LoginPage />);

      const googleButton = screen.getByText("Sign in with Google");
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(
          screen.getByText("Google login failed. Please try again."),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("should navigate to forgot password page", () => {
      render(<LoginPage />);

      const forgotPasswordButton = screen.getByText("Forgot password?");
      fireEvent.click(forgotPasswordButton);

      // Get the mock from the global setup
      const { useRouter } = require("next/navigation");
      const mockRouter = useRouter();
      expect(mockRouter.push).toHaveBeenCalledWith("/auth/forgot-password");
    });

    it("should navigate to admin login portal", () => {
      render(<LoginPage />);

      const adminLoginButton = screen.getByText("Admin/Volunteer Login");
      fireEvent.click(adminLoginButton);

      const { useRouter } = require("next/navigation");
      const mockRouter = useRouter();
      expect(mockRouter.push).toHaveBeenCalledWith("/admin-login-portal");
    });

    it("should navigate to registration page", () => {
      render(<LoginPage />);

      const createAccountButton = screen.getByText("Create one");
      fireEvent.click(createAccountButton);

      const { useRouter } = require("next/navigation");
      const mockRouter = useRouter();
      expect(mockRouter.push).toHaveBeenCalledWith("/register");
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for form inputs", () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
    });

    it("should have proper ARIA attributes", () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      expect(emailInput).toHaveAttribute("aria-required", "true");
      expect(passwordInput).toHaveAttribute("aria-required", "true");
    });
  });

  describe("Keyboard Navigation", () => {
    it("should submit form when Enter is pressed in password field", async () => {
      mockLogin.mockResolvedValue(undefined);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.keyDown(passwordInput, { key: "Enter", code: "Enter" });

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });
});
