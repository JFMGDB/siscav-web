import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  type Breakpoint,
} from "@mui/material";

type HideBelow = Breakpoint;

function columnDisplaySx(hideBelow?: HideBelow) {
  if (!hideBelow) return undefined;
  const breakpoints: Breakpoint[] = ["xs", "sm", "md", "lg", "xl"];
  const idx = breakpoints.indexOf(hideBelow);
  if (idx <= 0) return undefined;
  const display: Record<string, string> = {};
  for (let i = 0; i < idx; i++) {
    display[breakpoints[i]] = "none";
  }
  for (let i = idx; i < breakpoints.length; i++) {
    display[breakpoints[i]] = "table-cell";
  }
  return { display };
}

/** Data bound to a key of row type T. */
export type FieldColumn<T extends { id: string | number }> = {
  columnType: "field";
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  hideBelow?: HideBelow;
  format?: (value: T[keyof T], row: T) => React.ReactNode;
};

/** Synthetic column (e.g. action buttons) — not a property of T. */
export type ActionsColumn<T extends { id: string | number }> = {
  columnType: "actions";
  id: "actions";
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  hideBelow?: HideBelow;
  format: (row: T) => React.ReactNode;
};

export type Column<T extends { id: string | number }> =
  | FieldColumn<T>
  | ActionsColumn<T>;

export interface DataTableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  loading = false,
  emptyMessage = "Nenhum registro encontrado.",
  onRowClick,
}: DataTableProps<T>) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
    >
      <Table sx={{ minWidth: 480 }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={String(column.id)}
                align={column.align}
                style={{ minWidth: column.minWidth }}
                sx={columnDisplaySx(column.hideBelow)}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 4,
                  }}
                >
                  <CircularProgress size={32} />
                </Box>
              </TableCell>
            </TableRow>
          ) : !rows || rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Box sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                onClick={() => onRowClick?.(row)}
                sx={{
                  cursor: onRowClick ? "pointer" : "default",
                  "&:hover": {
                    backgroundColor: "rgba(37, 99, 235, 0.04)",
                  },
                }}
              >
                {columns.map((column) => {
                  if (column.columnType === "actions") {
                    return (
                      <TableCell
                        key="actions"
                        align={column.align}
                        sx={columnDisplaySx(column.hideBelow)}
                      >
                        {column.format(row)}
                      </TableCell>
                    );
                  }
                  const value = row[column.id];
                  return (
                    <TableCell
                      key={String(column.id)}
                      align={column.align}
                      sx={columnDisplaySx(column.hideBelow)}
                    >
                      {column.format
                        ? column.format(value, row)
                        : (value as React.ReactNode)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
