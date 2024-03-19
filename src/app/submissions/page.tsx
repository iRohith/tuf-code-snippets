"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Editor } from "@monaco-editor/react";
import { useTheme } from "next-themes";

const zLanguage = z.enum(["cpp", "java", "javascript", "python"]);
const zStatus = z.enum(["success", "failure", "error", "api_failure"]);

const zSortBy = z.enum([
  "timestamp_asc",
  "timestamp_dsc",
  "username_asc",
  "username_dsc",
  "language_asc",
  "language_dsc",
]);

const zSubmission = z.object({
  id: z.number().int(),
  timestamp: z.coerce.date(),
  username: z.string(),
  language: zLanguage,
  stdin: z.string(),
  code: z.string(),
  stdout: z.string(),
  status: zStatus,
});

const zSearchParams = z.object({
  username: z.string().optional(),
  language: zLanguage.array().optional(),
  status: zStatus.array().optional(),
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: zSortBy.default("timestamp_dsc"),
});

type Submission = z.infer<typeof zSubmission>;
type SearchParams = z.infer<typeof zSearchParams>;

function formatDate(date: Date): string {
  // Extract time parts
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Format time part
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert to 12-hour format
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");
  const timePart = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;

  // Format date part
  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);

  // Combine time and date parts
  return `${timePart}, ${datePart}`;
}

function objectToUrlParams(obj: Record<string, any>): string {
  const params: string[] = [];
  for (const key in obj) {
    if (obj[key] !== undefined) {
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
    }
  }
  return params.join("&");
}

async function fetchSubmissions(params: SearchParams) {
  return zSubmission
    .array()
    .parse(
      await (
        await fetch(
          `http://localhost:3000/api/submissions?${objectToUrlParams(params)}`
        )
      ).json()
    );
}

export default function Page() {
  const { theme } = useTheme();
  const [data, setData] = useState<Submission[]>([]);
  const [params, setParams] = useState<SearchParams>({
    page: 1,
    page_size: 10,
    sortBy: "timestamp_dsc",
  });

  const [hasNext, setHasNext] = useState(true);

  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      fetchSubmissions(params).then((submissions) => {
        setData([...data, ...submissions]);
        if (submissions.length === 0) setHasNext(false);
        else setParams({ ...params, page: params.page + 1 });
      });
    }
  }, [inView, params, data]);

  const columns: ColumnDef<Submission>[] = [
    {
      accessorKey: "timestamp",
      header: () => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              setData([]);
              setHasNext(true);
              setParams({
                ...params,
                page: 1,
                sortBy:
                  params.sortBy === "timestamp_dsc"
                    ? "timestamp_asc"
                    : "timestamp_dsc",
              });
            }}
          >
            Submitted at
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => formatDate(row.getValue("timestamp") as Date),
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "language",
      header: "Language",
    },
    {
      accessorKey: "stdin",
      header: "STDIN",
    },
    // {
    //   accessorKey: "stdout",
    //   header: "STDOUT",
    // },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <Dialog>
          <DialogTrigger>
            {(row.getValue("code") as string).slice(0, 100)}
          </DialogTrigger>
          <DialogContent className="min-w-fit">
            <div className="w-[70vw]">
              <Editor
                className="border"
                width="70vw"
                height="60vh"
                language={row.getValue("language")}
                theme={theme === "light" ? "light" : "vs-dark"}
                value={row.getValue("code")}
              />
            </div>
          </DialogContent>
        </Dialog>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <main className="w-full h-full mt-20">
      <div className="rounded-md border m-5">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div
        ref={ref}
        className={cn(
          "w-full flex justify-center items-center",
          !hasNext ? "hidden" : ""
        )}
      >
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    </main>
  );
}
