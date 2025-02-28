"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import { useOrigin } from "@/hooks/use-origin";
import { useSession } from "@/hooks/use-session";
import { Settings2, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProducts } from "@/actions/products/products/delete";
import { useRouter } from "next/navigation";

export type Products = {
  id: string; // Supprimez l'`id`
  name: string;
  description: string;
  categories: string;
  image: string;
};

const headerColumn = () => {
  const translate = useTranslations("Products")
  return translate("title")
}
const headerColumnDescription = () => {
  const translate = useTranslations("Products")
  return translate("description")
}

const headerColumnCategories = () => {
  const translate = useTranslations("Products")
  return translate("categories")
}

const actionsCell = (row: any) => {
  const products = row.original;
  const { session } = useSession()
  const router = useRouter();
  const origin = useOrigin()
  const hasPermissionDeleteProducts = (session?.user?.permissions.find((permission: string) => permission === "products_delete") ?? false) || session?.user?.isAdmin;
  const hasPermissionUpdateProducts = (session?.user?.permissions.find((permission: string) => permission === "products_update") ?? false) || session?.user?.isAdmin;

  return (
    <div className="flex gap-2">
      {hasPermissionDeleteProducts && <Button
        onClick={() => {
          deleteProducts([products.id])
          window.location.reload()
        }}
        variant="destructive"
      >
        <Trash />
      </Button>}
      {hasPermissionUpdateProducts && <Button variant={"outline"} onClick={() => router.push(`${origin}/admin/products/product/${products.id}/update`)}>
        <Settings2 />
      </Button>}
    </div>
  );
};


export const columns: ColumnDef<Products>[] = [
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
      <div >
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: headerColumnDescription,
    cell: ({ row }) => (
      <div >
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "categories",
    header: headerColumnCategories,
    cell: ({ row }) => (
      <div className="w-4/6">
        {row.getValue("categories")}
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