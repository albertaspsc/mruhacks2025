/**
 * Utility functions for CSV export functionality
 */

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  getValue: (item: T) => string;
}

/**
 * Export data to CSV
 */
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
): void {
  const csvContent = [
    columns.map((col) => col.header),
    ...data.map((item) => columns.map((col) => col.getValue(item))),
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Generate filename with current date
 */
export function generateFilename(baseName: string, extension = "csv"): string {
  const date = new Date().toISOString().split("T")[0];
  return `${baseName}_${date}.${extension}`;
}
