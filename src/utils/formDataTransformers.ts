/**
 * Common form data transformation utilities for handling form state merging,
 * data type conversions, and option transformations across the application.
 * Autobots, Roll out!
 */

/**
 * Merges form data from context with initial data, giving context data priority.
 * Supports custom field mappings for special handling of different data types.
 *
 * @param contextData - Data from form context that takes priority
 * @param initialData - Initial SSR data used as fallback
 * @param fieldMappings - Optional field mappings for custom value handling
 * @returns Merged form data with context values taking priority over initial values
 */
export function mergeFormData<T extends Record<string, any>>(
  contextData: Partial<T>,
  initialData: Partial<T>,
  fieldMappings?: Partial<
    Record<keyof T, (contextValue: any, initialValue: any) => any>
  >,
): Partial<T> {
  const result: Partial<T> = {};

  // Get all unique keys from both objects
  const allKeys = new Set([
    ...Object.keys(contextData),
    ...Object.keys(initialData),
  ]);

  for (const key of allKeys) {
    const contextValue = contextData[key as keyof T];
    const initialValue = initialData[key as keyof T];

    // Use custom mapping if provided
    if (fieldMappings?.[key as keyof T]) {
      result[key as keyof T] = fieldMappings[key as keyof T]!(
        contextValue,
        initialValue,
      );
    } else {
      // Default behavior: context takes priority, fallback to initial
      result[key as keyof T] =
        contextValue !== undefined ? contextValue : initialValue;
    }
  }

  return result;
}

/**
 * Predefined field mappings for common form data merging scenarios.
 * Handles type conversions and fallback values for various form field types.
 */
export const commonFieldMappings = {
  /**
   * Handles boolean values, converting string representations to boolean types.
   * Keeps boolean values as-is and converts "true"/"false" strings to booleans.
   */
  previousAttendance: (
    contextValue: boolean | string | undefined,
    initialValue: boolean | undefined,
  ) => {
    if (contextValue !== undefined) {
      // Convert string "true"/"false" to boolean if needed
      if (typeof contextValue === "string") {
        return contextValue === "true";
      }
      return contextValue;
    }
    return initialValue;
  },

  /**
   * Handles array values with fallback to empty array.
   * Returns context value if available, otherwise initial value, or empty array.
   */
  interests: (
    contextValue: number[] | undefined,
    initialValue: number[] | undefined,
  ) => contextValue || initialValue || [],

  /**
   * Handles dietary restrictions array with fallback to empty array.
   * Returns context value if available, otherwise initial value, or empty array.
   */
  dietaryRestrictions: (
    contextValue: number[] | undefined,
    initialValue: number[] | undefined,
  ) => contextValue || initialValue || [],

  /**
   * Handles string values with fallback to empty string.
   * Returns context value if available, otherwise initial value, or empty string.
   */
  accommodations: (
    contextValue: string | undefined,
    initialValue: string | undefined,
  ) => contextValue || initialValue || "",

  /**
   * Handles resume string values with type checking and fallback to empty string.
   * Ensures string type and provides fallback values.
   */
  resume: (
    contextValue: string | undefined,
    initialValue: string | undefined,
  ) =>
    (typeof contextValue === "string" ? contextValue : "") ||
    initialValue ||
    "",

  /**
   * Handles gender selection with fallback to 0.
   * Returns context value if available, otherwise initial value, or 0.
   */
  gender: (
    contextValue: number | undefined,
    initialValue: number | undefined,
  ) => contextValue || initialValue || 0,

  /**
   * Handles university selection with fallback to 0.
   * Returns context value if available, otherwise initial value, or 0.
   */
  university: (
    contextValue: number | undefined,
    initialValue: number | undefined,
  ) => contextValue || initialValue || 0,

  /**
   * Handles major selection with fallback to 0.
   * Returns context value if available, otherwise initial value, or 0.
   */
  major: (contextValue: number | undefined, initialValue: number | undefined) =>
    contextValue || initialValue || 0,

  /**
   * Handles experience level selection with fallback to 0.
   * Returns context value if available, otherwise initial value, or 0.
   */
  experience: (
    contextValue: number | undefined,
    initialValue: number | undefined,
  ) => contextValue || initialValue || 0,

  /**
   * Handles marketing preference selection with fallback to 0.
   * Returns context value if available, otherwise initial value, or 0.
   */
  marketing: (
    contextValue: number | undefined,
    initialValue: number | undefined,
  ) => contextValue || initialValue || 0,

  /**
   * Handles parking preference with fallback to "Not sure".
   * Returns context value if available, otherwise initial value, or "Not sure".
   */
  parking: (
    contextValue: string | undefined,
    initialValue: string | undefined,
  ) => contextValue || initialValue || "Not sure",
} as const;

/**
 * Interface for select options with numeric ID and string label.
 * Used for dropdown selections that map to database records.
 */
export interface SelectOption {
  id: number;
  label: string;
}

/**
 * Interface for select options with string value and label.
 * Used for dropdown selections with string-based values.
 */
export interface StringSelectOption {
  value: string;
  label: string;
}

/**
 * Interface for checkbox options with numeric ID and string label.
 * Used for multi-select checkbox groups that map to database records.
 */
export interface CheckboxOption {
  id: number;
  label: string;
}

/**
 * Transforms database items into select options for dropdown components.
 * Extracts ID and label from database records for use in form selectors.
 *
 * @param items - Array of database items with id and label properties
 * @param labelKey - Key to extract the label from each item
 * @returns Array of SelectOption objects with id and label properties
 */
export function transformSelectOptions<
  T extends { id: number } & Record<string, any>,
>(items: T[], labelKey: keyof T): SelectOption[] {
  return items.map((item) => ({
    id: item.id,
    label: String(item[labelKey]),
  }));
}

/**
 * Transforms database items into checkbox options for multi-select components.
 * Extracts ID and label from database records for use in checkbox groups.
 *
 * @param items - Array of database items with id and label properties
 * @param labelKey - Key to extract the label from each item
 * @returns Array of CheckboxOption objects with id and label properties
 */
export function transformCheckboxOptions<
  T extends { id: number } & Record<string, any>,
>(items: T[], labelKey: keyof T): CheckboxOption[] {
  return items.map((item) => ({
    id: item.id,
    label: String(item[labelKey]),
  }));
}

/**
 * Transforms database items into string select options for dropdown components.
 * Extracts value and label from database records for use in string-based selectors.
 *
 * @param items - Array of database items with string properties
 * @param valueKey - Key to extract the value from each item
 * @param labelKey - Key to extract the label from each item
 * @returns Array of StringSelectOption objects with value and label properties
 */
export function transformStringSelectOptions<
  T extends { [key: string]: string },
>(items: T[], valueKey: keyof T, labelKey: keyof T): StringSelectOption[] {
  return items.map((item) => ({
    value: item[valueKey] as string,
    label: item[labelKey] as string,
  }));
}

/**
 * Predefined transformers for common form option types.
 * Provides convenient functions for transforming database records into form options.
 */
export const formOptionTransformers = {
  /**
   * Transforms gender records into select options.
   * @param genders - Array of gender records from database
   * @returns Array of SelectOption objects for gender selection
   */
  genders: (genders: { id: number; gender: string }[]) =>
    transformSelectOptions(genders, "gender"),

  /**
   * Transforms university records into select options.
   * @param universities - Array of university records from database
   * @returns Array of SelectOption objects for university selection
   */
  universities: (universities: { id: number; uni: string }[]) =>
    transformSelectOptions(universities, "uni"),

  /**
   * Transforms major records into select options.
   * @param majors - Array of major records from database
   * @returns Array of SelectOption objects for major selection
   */
  majors: (majors: { id: number; major: string }[]) =>
    transformSelectOptions(majors, "major"),

  /**
   * Transforms interest records into checkbox options.
   * @param interests - Array of interest records from database
   * @returns Array of CheckboxOption objects for interest selection
   */
  interests: (interests: { id: number; interest: string }[]) =>
    transformCheckboxOptions(interests, "interest"),

  /**
   * Transforms dietary restriction records into checkbox options.
   * @param restrictions - Array of dietary restriction records from database
   * @returns Array of CheckboxOption objects for dietary restriction selection
   */
  dietaryRestrictions: (restrictions: { id: number; restriction: string }[]) =>
    transformCheckboxOptions(restrictions, "restriction"),

  /**
   * Transforms marketing type records into select options.
   * @param marketing - Array of marketing type records from database
   * @returns Array of SelectOption objects for marketing type selection
   */
  marketingTypes: (marketing: { id: number; marketing: string }[]) =>
    transformSelectOptions(marketing, "marketing"),
} as const;
