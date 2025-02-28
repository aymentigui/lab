"use client";

import {
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
import { columns } from "./columns-products"; // Importez les colonnes
import { Products } from "./columns-products";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { useTranslations } from "next-intl";
import { useSession } from "@/hooks/use-session";
import { useOrigin } from "@/hooks/use-origin";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import Loading from "@/components/myui/loading";
import { Button } from "@/components/ui/button";
import { getProducts, getProductsCount } from "@/actions/products/products/get";

interface DataTableProps {
    products: Products[];
    selectedProductsIds?: string[];
    setSelectedProductsIds: (prodcutsCategoryIds: string[]) => void;
}

export function DataTable({
    products,
    selectedProductsIds,
    setSelectedProductsIds
}: DataTableProps) {

    const origin = useOrigin()
    const router = useRouter()
    const searchParams = useSearchParams();

    const [data, setData] = useState<Products[]>(products);

    const [page, setPage] = useState(searchParams.get("page") ? Number(searchParams.get("page")) : 1);
    const pageSize = 8
    const [count, setCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState(""); // État pour la recherche
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(""); // État pour la recherche avec debounce

    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const { session } = useSession()
    const hasPermissionAction = (session?.user?.permissions.find((permission: string) => permission === "products_update" || permission === "products_delete") ?? false) ||
        session?.user?.isAdmin;

    const s = useTranslations('System')
    useEffect(() => {
        setSelectedLanguage(Cookies.get('lang') || 'en')
        setMounted(true);
    }, [])

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // Délai de 500 ms

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    useEffect(() => {
        fetchProducts();
    }, [page, debouncedSearchQuery, mounted]); // Ajouter debouncedSearchQuery comme dépendance


    const fetchProducts = async () => {
        setIsLoading(true);
        setData([]);
        try {
            if (!origin) return

            const response = await getProducts(page, pageSize, debouncedSearchQuery);

            if (response.status === 200) {
                const formattedUsers = response.data.map((product:any) => ({
                    ...product,
                    categories: product.categories.map((categorie:any) => categorie.name).join(", "),
                }));
                setData(formattedUsers);
            }

            const countResponse = await getProductsCount(debouncedSearchQuery)
            if (countResponse.status === 200) {
                setCount(countResponse.data);
            }

        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const table = useReactTable({
        data: data,
        columns, // Utilisez les colonnes importées
        getCoreRowModel: getCoreRowModel(),
        state: {
            rowSelection: selectedProductsIds
                ? selectedProductsIds.reduce((acc, id) => {
                    const index = data.findIndex((product) => product.id === id);
                    if (index === -1) {
                        return acc;
                    }
                    acc[index] = true;
                    return acc;
                }, {} as Record<string, boolean>)
                : selectedProducts.reduce((acc, id) => {
                    acc[id] = true;
                    return acc;
                }, {} as Record<string, boolean>),
        },
        onRowSelectionChange: (updaterOrValue) => {
            const newRowSelection =
                typeof updaterOrValue === "function"
                    ? updaterOrValue(table.getState().rowSelection)
                    : updaterOrValue;
            const selectedIndexes = Object.keys(newRowSelection).filter(
                (name) => newRowSelection[name]
            );
            const selectedProductsIds2 = selectedIndexes.map((id) => table.getRowModel().rows.find((row) => row.id === id)?.original.id || '')
            setSelectedProductsIds(selectedProductsIds2)
            setSelectedProducts(selectedIndexes);
        },
    });


    if (!mounted) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <div>
            <Input
                placeholder={s("search")}
                value={searchQuery} // Utiliser searchQuery au lieu de globalFilter
                onChange={(event) => setSearchQuery(event.target.value)} // Mettre à jour searchQuery
                className="max-w-sm mb-4"
            />
            {
                isLoading
                    ?
                    (<div className="h-[300px] flex items-center justify-center">
                        <Loading />
                    </div>)
                    :
                    <div className="rounded-md border p-2">
                        <Table className="border">
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            (header.id !== "actions" || hasPermissionAction)
                                                ? <TableHead key={header.id}
                                                    className={`
                                    ${selectedLanguage == "ar" ? "text-right " : ""} 
                                    ${header.id === "actions" ? "w-[130px]" : ""} 
                                    `}>
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                </TableHead>
                                                : null
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
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
                    </div>
            }
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