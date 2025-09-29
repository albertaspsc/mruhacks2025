import {
  getAdminWorkshopsAction,
  createWorkshopAction,
  updateWorkshopAction,
  deleteWorkshopAction,
  getWorkshopAction,
  getWorkshopRegistrationsAction,
} from "@/actions/adminActions";
import { createClient } from "@/utils/supabase/server";
import { AdminWorkshopFormData, AdminWorkshop } from "@/types/admin";
import { ServiceResult } from "@/types/registration";

// Mock dependencies
jest.mock("@/utils/supabase/server");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockRevalidatePath = require("next/cache")
  .revalidatePath as jest.MockedFunction<any>;

// Test data factories
const createMockAdmin = (overrides: any = {}) => ({
  id: "admin123",
  role: "admin",
  status: "active",
  ...overrides,
});

const createMockUser = (overrides: any = {}) => ({
  id: "user123",
  email: "admin@example.com",
  ...overrides,
});

const createMockWorkshop = (overrides: any = {}): AdminWorkshop => ({
  id: "workshop123",
  title: "Test Workshop",
  description: "Test Description",
  date: "2024-01-15",
  startTime: "10:00",
  endTime: "12:00",
  location: "Test Location",
  maxCapacity: 50,
  isActive: true,
  currentRegistrations: 0,
  ...overrides,
});

const createMockWorkshopFormData = (
  overrides: Partial<AdminWorkshopFormData> = {},
): AdminWorkshopFormData => ({
  title: "Test Workshop",
  description: "Test Description",
  date: "2024-01-15",
  startTime: "10:00",
  endTime: "12:00",
  location: "Test Location",
  maxCapacity: 50,
  isActive: true,
  ...overrides,
});

const createMockWorkshopRegistration = (overrides: any = {}) => ({
  id: "reg123",
  registered_at: "2024-01-10T10:00:00Z",
  f_name: "John",
  l_name: "Doe",
  yearOfStudy: "3rd Year",
  gender: "Male",
  major: "Computer Science",
  ...overrides,
});

describe("Admin Actions", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
          in: jest.fn(() => ({
            order: jest.fn(),
          })),
          order: jest.fn(),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(),
        })),
      })),
    };
    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  describe("getAdminWorkshopsAction", () => {
    it("should successfully fetch workshops with registration counts", async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      const mockUser = createMockUser();
      const mockWorkshops = [
        {
          id: "workshop1",
          title: "Workshop 1",
          date: "2024-01-15",
          startTime: "10:00",
          endTime: "12:00",
          location: "Room 1",
          maxCapacity: 50,
          isActive: true,
          description: "Description 1",
        },
        {
          id: "workshop2",
          title: "Workshop 2",
          date: "2024-01-16",
          startTime: "14:00",
          endTime: "16:00",
          location: "Room 2",
          maxCapacity: 30,
          isActive: true,
          description: "Description 2",
        },
      ];
      const mockRegistrations = [
        { workshop_id: "workshop1" },
        { workshop_id: "workshop1" },
        { workshop_id: "workshop2" },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAdmin,
          error: null,
        }),
      };

      const mockWorkshopsQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockWorkshops,
          error: null,
        }),
      };

      const mockRegistrationsQuery = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: mockRegistrations,
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockAdminsQuery)
        .mockReturnValueOnce(mockWorkshopsQuery)
        .mockReturnValueOnce(mockRegistrationsQuery);

      // Act
      const result = await getAdminWorkshopsAction();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0]).toMatchObject({
        id: "workshop1",
        title: "Workshop 1",
        currentRegistrations: 2,
      });
      expect(result.data![1]).toMatchObject({
        id: "workshop2",
        title: "Workshop 2",
        currentRegistrations: 1,
      });
    });

    it("should return error when user is not authenticated", async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      // Act
      const result = await getAdminWorkshopsAction();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("Authentication required");
    });

    it("should return error when user is not an admin", async () => {
      // Arrange
      const mockUser = createMockUser();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        }),
      };

      mockSupabase.from.mockReturnValueOnce(mockAdminsQuery);

      // Act
      const result = await getAdminWorkshopsAction();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("Admin access required");
    });

    it("should return error when admin status is not active", async () => {
      // Arrange
      const mockUser = createMockUser();
      const mockInactiveAdmin = createMockAdmin({ status: "inactive" });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockInactiveAdmin,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValueOnce(mockAdminsQuery);

      // Act
      const result = await getAdminWorkshopsAction();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("Admin access required");
    });

    it("should return error when workshops fetch fails", async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      const mockUser = createMockUser();

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAdmin,
          error: null,
        }),
      };

      const mockWorkshopsQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockAdminsQuery)
        .mockReturnValueOnce(mockWorkshopsQuery);

      // Act
      const result = await getAdminWorkshopsAction();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to fetch workshops");
    });
  });

  describe("createWorkshopAction", () => {
    it("should successfully create a workshop", async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      const mockUser = createMockUser();
      const formData = createMockWorkshopFormData();
      const mockCreatedWorkshop = {
        id: "new-workshop-123",
        title: formData.title,
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        maxCapacity: formData.maxCapacity,
        isActive: formData.isActive,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAdmin,
          error: null,
        }),
      };

      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCreatedWorkshop,
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockAdminsQuery)
        .mockReturnValueOnce(mockInsertQuery);

      // Act
      const result = await createWorkshopAction(formData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: "new-workshop-123",
        title: formData.title,
        description: formData.description,
        currentRegistrations: 0,
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/dashboard");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/workshops");
    });

    it("should return error when admin validation fails", async () => {
      // Arrange
      const formData = createMockWorkshopFormData();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      // Act
      const result = await createWorkshopAction(formData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("Authentication required");
    });

    it("should return error when workshop creation fails", async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      const mockUser = createMockUser();
      const formData = createMockWorkshopFormData();

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAdmin,
          error: null,
        }),
      };

      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockAdminsQuery)
        .mockReturnValueOnce(mockInsertQuery);

      // Act
      const result = await createWorkshopAction(formData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
    });
  });

  describe("updateWorkshopAction", () => {
    it("should successfully update a workshop", async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      const mockUser = createMockUser();
      const workshopId = "workshop123";
      const formData = createMockWorkshopFormData({
        title: "Updated Workshop",
      });
      const mockUpdatedWorkshop = {
        id: workshopId,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        maxCapacity: formData.maxCapacity,
        isActive: formData.isActive,
      };
      const mockRegistrations = [{ id: "reg1" }, { id: "reg2" }];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAdmin,
          error: null,
        }),
      };

      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedWorkshop,
          error: null,
        }),
      };

      const mockRegistrationsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockRegistrations,
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockAdminsQuery)
        .mockReturnValueOnce(mockUpdateQuery)
        .mockReturnValueOnce(mockRegistrationsQuery);

      // Act
      const result = await updateWorkshopAction(workshopId, formData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: workshopId,
        title: "Updated Workshop",
        currentRegistrations: 2,
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/dashboard");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/workshops");
    });

    it("should return error when workshop not found", async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      const mockUser = createMockUser();
      const workshopId = "nonexistent-workshop";
      const formData = createMockWorkshopFormData();

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAdmin,
          error: null,
        }),
      };

      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockAdminsQuery)
        .mockReturnValueOnce(mockUpdateQuery);

      // Act
      const result = await updateWorkshopAction(workshopId, formData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("Workshop not found");
    });
  });

  describe("deleteWorkshopAction", () => {
    it("should successfully delete a workshop", async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      const mockUser = createMockUser();
      const workshopId = "workshop123";
      const mockWorkshop = { id: workshopId };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAdmin,
          error: null,
        }),
      };

      const mockFetchQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockWorkshop,
          error: null,
        }),
      };

      const mockDeleteQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockAdminsQuery)
        .mockReturnValueOnce(mockFetchQuery)
        .mockReturnValueOnce(mockDeleteQuery);

      // Act
      const result = await deleteWorkshopAction(workshopId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ message: "Workshop deleted successfully" });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/dashboard");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/workshops");
    });

    it("should return error when workshop not found", async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      const mockUser = createMockUser();
      const workshopId = "nonexistent-workshop";

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAdmin,
          error: null,
        }),
      };

      const mockFetchQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockAdminsQuery)
        .mockReturnValueOnce(mockFetchQuery);

      // Act
      const result = await deleteWorkshopAction(workshopId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("Workshop not found");
    });
  });

  describe("getWorkshopAction", () => {
    it("should successfully fetch a single workshop", async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      const mockUser = createMockUser();
      const workshopId = "workshop123";
      const mockWorkshop = {
        id: workshopId,
        title: "Test Workshop",
        description: "Test Description",
        date: "2024-01-15",
        startTime: "10:00",
        endTime: "12:00",
        location: "Test Location",
        maxCapacity: 50,
        isActive: true,
      };
      const mockRegistrations = [{ id: "reg1" }, { id: "reg2" }];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAdmin,
          error: null,
        }),
      };

      const mockWorkshopQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockWorkshop,
          error: null,
        }),
      };

      const mockRegistrationsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockRegistrations,
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockAdminsQuery)
        .mockReturnValueOnce(mockWorkshopQuery)
        .mockReturnValueOnce(mockRegistrationsQuery);

      // Act
      const result = await getWorkshopAction(workshopId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: workshopId,
        title: "Test Workshop",
        currentRegistrations: 2,
      });
    });

    it("should return error when workshop not found", async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      const mockUser = createMockUser();
      const workshopId = "nonexistent-workshop";

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAdmin,
          error: null,
        }),
      };

      const mockWorkshopQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockAdminsQuery)
        .mockReturnValueOnce(mockWorkshopQuery);

      // Act
      const result = await getWorkshopAction(workshopId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("Workshop not found");
    });
  });

  describe("getWorkshopRegistrationsAction", () => {
    it("should successfully fetch workshop registrations", async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      const mockUser = createMockUser();
      const workshopId = "workshop123";
      const mockRegistrations = [
        createMockWorkshopRegistration({
          id: "reg1",
          f_name: "John",
          l_name: "Doe",
          yearOfStudy: "3rd Year",
          gender: "Male",
          major: "Computer Science",
        }),
        createMockWorkshopRegistration({
          id: "reg2",
          f_name: "Jane",
          l_name: "Smith",
          yearOfStudy: "2nd Year",
          gender: "Female",
          major: "Engineering",
        }),
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAdmin,
          error: null,
        }),
      };

      const mockRegistrationsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockRegistrations,
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockAdminsQuery)
        .mockReturnValueOnce(mockRegistrationsQuery);

      // Act
      const result = await getWorkshopRegistrationsAction(workshopId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0]).toMatchObject({
        id: "reg1",
        participant: {
          firstName: "John",
          lastName: "Doe",
          fullName: "John Doe",
          yearOfStudy: "3rd Year",
          gender: "Male",
          major: "Computer Science",
        },
      });
      expect(result.data![1]).toMatchObject({
        id: "reg2",
        participant: {
          firstName: "Jane",
          lastName: "Smith",
          fullName: "Jane Smith",
          yearOfStudy: "2nd Year",
          gender: "Female",
          major: "Engineering",
        },
      });
    });

    it("should return error when registrations fetch fails", async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      const mockUser = createMockUser();
      const workshopId = "workshop123";

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAdmin,
          error: null,
        }),
      };

      const mockRegistrationsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockAdminsQuery)
        .mockReturnValueOnce(mockRegistrationsQuery);

      // Act
      const result = await getWorkshopRegistrationsAction(workshopId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to fetch workshop registrations");
    });

    it("should handle empty registrations gracefully", async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      const mockUser = createMockUser();
      const workshopId = "workshop123";

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAdmin,
          error: null,
        }),
      };

      const mockRegistrationsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockAdminsQuery)
        .mockReturnValueOnce(mockRegistrationsQuery);

      // Act
      const result = await getWorkshopRegistrationsAction(workshopId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe("Error handling", () => {
    it("should handle unexpected errors gracefully", async () => {
      // Arrange
      mockSupabase.auth.getUser.mockRejectedValue(
        new Error("Unexpected error"),
      );

      // Act
      const result = await getAdminWorkshopsAction();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to validate admin permissions");
    });

    it("should handle database connection errors", async () => {
      // Arrange
      const mockAdmin = createMockAdmin();
      const mockUser = createMockUser();

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockAdminsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockRejectedValue(new Error("Database connection failed")),
      };

      mockSupabase.from.mockReturnValueOnce(mockAdminsQuery);

      // Act
      const result = await getAdminWorkshopsAction();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to validate admin permissions");
    });
  });
});
