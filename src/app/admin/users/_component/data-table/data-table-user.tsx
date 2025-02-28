"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import Loading from "@/components/myui/loading";
import axios from "axios";
import { useOrigin } from "@/hooks/use-origin";
import { useRouter, useSearchParams } from "next/navigation";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
}: DataTableProps<TData, TValue>) {

  const origin = useOrigin()
  const router = useRouter()
  const searchParams = useSearchParams();

  const [data, setData] = useState<TData[]>(initialData);

  const [page, setPage] = useState(searchParams.get("page") ? Number(searchParams.get("page")) : 1);
  const pageSize = 8
  const [count, setCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // État pour la recherche
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(""); // État pour la recherche avec debounce

  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { session } = useSession();
  const s = useTranslations("System");

  // Débounce la recherche (pour attendre un peu de time)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Délai de 500 ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch users when the page or search query changes
  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearchQuery, origin]); // Ajouter debouncedSearchQuery comme dépendance

  const fetchUsers = async () => {
    setIsLoading(true);
    setData([]);
    try {
      if (!origin) return

      const response = await axios(origin + "/api/admin/users", { params: { page, pageSize, search: debouncedSearchQuery } });
      console.log(response)
      if (response.status === 200) {
        setData(response.data);
      }

      const countResponse = await axios(origin + "/api/admin/users", { params: { search: debouncedSearchQuery, count: true } });
      if (countResponse.status === 200) {
        setCount(countResponse.data);
      }

    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark the component as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // Supprimer getFilteredRowModel
  });

  const hasPermissionAction =
    (session?.user?.permissions.find((permission: string) => permission === "users_update" || permission === "users_delete") ?? false) ||
    session?.user?.isAdmin;

  if (!mounted) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Input
        placeholder={s("search")}
        value={searchQuery} // Utiliser searchQuery au lieu de globalFilter
        onChange={(event) => setSearchQuery(event.target.value)} // Mettre à jour searchQuery
        className="max-w-sm mb-4"
      />
      {
        isLoading
          ? (<div className="h-[300px] flex items-center justify-center">
            <Loading />
          </div>)
          : <div className="rounded-md border p-2">
            <Table className="border">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) =>
                      header.id !== "actions" || hasPermissionAction ? (
                        <TableHead key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ) : null
                    )}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) =>
                        cell.column.id !== "actions" || hasPermissionAction ? (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ) : null
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {s("noresults")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>}

      {/* Pagination */}
      {!isLoading && <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            router.push(`/admin/users?page=${Math.max(page - 1, 1)}${searchQuery && searchQuery != "" ? "&search=" + searchQuery : ""}`)
            setPage((prev) => Math.max(prev - 1, 1))
          }
          }
          disabled={page === 1 || isLoading}
        >
          {s("back")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setPage((prev) => prev + 1); router.push(`/admin/users?page=${page + 1}${searchQuery && searchQuery != "" ? "&search=" + searchQuery : ""}`) }}
          disabled={page === Math.ceil(count / pageSize) || isLoading}
        >
          {s("next")}
        </Button>
      </div>}
    </div>
  );
}