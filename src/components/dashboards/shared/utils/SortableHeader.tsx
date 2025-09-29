import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { type Column } from "@tanstack/react-table";

interface SortableHeaderProps {
  column: Column<any, unknown>;
  children: React.ReactNode;
  className?: string;
}

export function SortableHeader({
  column,
  children,
  className = "",
}: SortableHeaderProps) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className={`h-8 px-2 lg:px-3 ${className}`}
      data-testid="sortable-header"
    >
      {children}
      {column.getIsSorted() === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}
