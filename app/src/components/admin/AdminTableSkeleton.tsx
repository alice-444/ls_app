import { useId, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminTableSkeletonProps {
  rowCount?: number;
  columnCount: number;
  showCheckbox?: boolean;
}

export function AdminTableSkeleton({
  rowCount = 5,
  columnCount,
  showCheckbox = true,
}: Readonly<AdminTableSkeletonProps>) {
  const baseId = useId();
  const rowKeys = useMemo(
    () => Array.from({ length: rowCount }, (_, i) => `${baseId}-r-${i}`),
    [baseId, rowCount]
  );
  const colKeys = useMemo(
    () => Array.from({ length: columnCount }, (_, i) => `${baseId}-c-${i}`),
    [baseId, columnCount]
  );

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            {showCheckbox && (
              <TableHead className="w-[40px] px-4">
                <Skeleton className="h-4 w-4" />
              </TableHead>
            )}
            {colKeys.map((colKey) => (
              <TableHead key={colKey}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rowKeys.map((rowKey) => (
            <TableRow key={rowKey}>
              {showCheckbox && (
                <TableCell className="px-4">
                  <Skeleton className="h-4 w-4" />
                </TableCell>
              )}
              {colKeys.map((colKey) => (
                <TableCell key={`${rowKey}-${colKey}`}>
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-full max-w-[150px]" />
                    {colKey === colKeys[0] && <Skeleton className="h-3 w-24 opacity-50" />}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
