"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import { useOrigin } from "@/hooks/use-origin";
import { useAddUpdateProductsCategoryDialog } from "@/context/add-update-products-category-dialog-context";
import { useSession } from "@/hooks/use-session";
import { Settings2, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteProductsCategory } from "@/actions/products/categories/delete";

export type ProductsCategories = {
  id: string; // Supprimez l'`id`
  name: string;
};

const headerColumn = () => {
  const translate = useTranslations("ProductsCategories")
  return translate("title")
}

const actionsCell = (row: any) => {
  const productsCategory = row.original;
  const { openDialog } = useAddUpdateProductsCategoryDialog();
  const { session } = useSession()
  const hasPermissionDeleteProductsCategories = (session?.user?.permissions.find((permission: string) => permission === "products_categories_delete") ?? false) || session?.user?.isAdmin;
  const hasPermissionUpdateProductsCategories = (session?.user?.permissions.find((permission: string) => permission === "products_categories_update") ?? false) || session?.user?.isAdmin;

  const handleOpenDialogWithTitle = () => {
    openDialog(false, row.original)
  };

  return (
    <div className="flex gap-2">
      {hasPermissionDeleteProductsCategories && <Button
        onClick={() => DeleteProductsCategory(productsCategory.id)}
        variant="destructive"
      >
        <Trash />
      </Button>}
      {hasPermissionUpdateProductsCategories && <Button variant={"outline"} onClick={handleOpenDialogWithTitle}>
        <Settings2 />
      </Button>}
    </div>
  );
};


export const columns: ColumnDef<ProductsCategories>[] = [
  {
    id: "actionsCheck",
    header: ({ table }) => {
      const allSelected = table.getIsAllRowsSelected(); // Vérifie si toutes les lignes sont sélectionnées

      return (
        <Checkbox
          checked={allSelected}
          onCheckedChange={(value) => {
            table.toggleAllRowsSelected(!!value); // Sélectionne ou désélectionne toutes les lignes
          }}
        />
      );
    },
    cell: ({ row }) => {
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      );
    },
  },
  {
    accessorKey: "name",
    header: headerColumn,
    cell: ({ row }) => (
      <div className="w-5/6">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      return actionsCell(row);
    },
  },
];