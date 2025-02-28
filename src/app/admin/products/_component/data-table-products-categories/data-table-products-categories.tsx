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
import { columns } from "./columns-products-categories"; // Importez les colonnes
import { ProductsCategories } from "./columns-products-categories";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { useTranslations } from "next-intl";
import { useSession } from "@/hooks/use-session";

interface DataTableProps {
    productsCategories: ProductsCategories[];
    selectedProductsCategoriesIds?: string[];
    setSelectedProductsCategoriesIds: (prodcutsCategoryIds: string[]) => void;
}

export function DataTable({
    productsCategories,
    selectedProductsCategoriesIds,
    setSelectedProductsCategoriesIds
}: DataTableProps) {

    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [selectedProductsCategories, setSelectedProductsCategories] = useState<string[]>([]);
    const { session } = useSession()
    const hasPermissionAction = (session?.user?.permissions.find((permission: string) => permission === "products_categories_update" || permission === "products_categories_delete") ?? false) ||
        session?.user?.isAdmin;

    const s = useTranslations('System')
    useEffect(() => {
        setSelectedLanguage(Cookies.get('lang') || 'en')
    }, [])

    const table = useReactTable({
        data: productsCategories,
        columns, // Utilisez les colonnes importées
        getCoreRowModel: getCoreRowModel(),
        state: {
            rowSelection: selectedProductsCategoriesIds
                ? selectedProductsCategoriesIds.reduce((acc, id) => {
                    const index = productsCategories.findIndex((productsCategory) => productsCategory.id === id);
                    if (index === -1) {
                        return acc;
                    }
                    acc[index] = true;
                    return acc;
                }, {} as Record<string, boolean>)
                : selectedProductsCategories.reduce((acc, id) => {
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
            const selectedProductsCategoriesIds2 = selectedIndexes.map((id) => table.getRowModel().rows.find((row) => row.id === id)?.original.id || '')
            setSelectedProductsCategoriesIds(selectedProductsCategoriesIds2)
            setSelectedProductsCategories(selectedIndexes);
        },
    });

    return (
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
                                    ${header.id === "name" ? "w-5/6" : ""} 
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
    );
}