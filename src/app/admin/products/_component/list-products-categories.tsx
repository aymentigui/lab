"use client"
import { DataTable } from "./data-table-products-categories/data-table-products-categories";
import { useState } from "react";
import { ProductsCategories } from "./data-table-products-categories/columns-products-categories";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DeleteProductsCategory } from "@/actions/products/categories/delete";
import { useRouter } from "next/navigation";

type ProductsCategoriesPageProps = {
  productsCategories: ProductsCategories[]
};

export default function ProductsCategoriesPageList({ productsCategories }: ProductsCategoriesPageProps) {
  const translate = useTranslations("ProductsCategories")
  const systemTranslate = useTranslations("System")

  const [selectedProductsCategoriesIds, setSelectedProductsCategoriesIds] = useState<string[]>([]);
  const [open,setOpen] = useState(false)

  const router = useRouter()

  const hadnleConfirm = async () => {
    if (selectedProductsCategoriesIds.length === 0) {
      toast.error(translate("selectcategory"))
      return
    }
    setOpen(!open)
  }

  const handleDelete = async () => {
    if(selectedProductsCategoriesIds.length === 0) return
    selectedProductsCategoriesIds.forEach(async (id) => {
      await DeleteProductsCategory(id)
    })
    toast.success(systemTranslate("deletesuccess"))
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold mb-4">{translate("title")}</h1>
        <AlertDialog open={open} onOpenChange={hadnleConfirm}>
          <AlertDialogTrigger asChild>
            <Button variant="outline">{translate("deletecategories")}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{translate("confermationdelete")}</AlertDialogTitle>
              <AlertDialogDescription>
              {translate("confermationdeletemessage")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOpen(false)}>{systemTranslate("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>{systemTranslate("confirm")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <DataTable
        productsCategories={productsCategories}
        selectedProductsCategoriesIds={selectedProductsCategoriesIds}
        setSelectedProductsCategoriesIds={setSelectedProductsCategoriesIds}
      />
    </div>
  );
}