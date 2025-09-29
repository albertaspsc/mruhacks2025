/**
 * Utility functions for generating table filters from data
 */

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  column: string;
  options: FilterOption[];
  placeholder: string;
}

/**
 * Generate filter options from an array of data
 */
export function generateFilterOptions<T>(
  data: T[],
  getValue: (item: T) => string | undefined,
  getLabel?: (value: string) => string,
): FilterOption[] {
  const uniqueValues = Array.from(new Set(data.map(getValue)))
    .filter(Boolean)
    .sort();

  return uniqueValues.map((value) => ({
    value: value!,
    label: getLabel ? getLabel(value!) : value!,
  }));
}

/**
 * Generate multiple filters from data
 */
export function generateFilters<T>(
  data: T[],
  configs: Array<{
    column: string;
    getValue: (item: T) => string | undefined;
    getLabel?: (value: string) => string;
    placeholder: string;
  }>,
): FilterConfig[] {
  return configs.map((config) => ({
    column: config.column,
    options: generateFilterOptions(data, config.getValue, config.getLabel),
    placeholder: config.placeholder,
  }));
}
