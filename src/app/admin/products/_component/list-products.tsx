"use client"
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DeleteProductsCategory } from "@/actions/products/categories/delete";
import { useRouter } from "next/navigation";
import { deleteProducts } from "@/actions/products/products/delete";
import { DataTable } from "./data-table-products/data-table-products";
import { useSession } from "@/hooks/use-session";



export default function ProductsPageList() {
  const translate = useTranslations("Products")
  const systemTranslate = useTranslations("System")

  const [selectedProductsIds, setSelectedProductsIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false)
  const { session } = useSession()

  const router = useRouter()

  const hadnleConfirm = async () => {
    if (selectedProductsIds.length === 0) {
      toast.error(translate("selectproducts"))
      return
    }
    setOpen(!open)
  }

  const handleDelete = async () => {
    if (selectedProductsIds.length === 0) return
    const res = await deleteProducts(selectedProductsIds)
    if (res.status === 200 && res.data.message) {
      toast.success(systemTranslate("deletesuccess"))
      setOpen(false)
      window.location.reload()
    } else {
      toast.success(systemTranslate("deletefail"))
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold mb-4">{translate("title")}</h1>
        {(session?.user?.permissions.find((permission: string) => permission === "products_delete") ?? false) || session?.user?.isAdmin
          &&
          <AlertDialog open={open} onOpenChange={hadnleConfirm}>
            <AlertDialogTrigger asChild>
              <Button variant="outline">{translate("deleteproducts")}</Button>
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
          </AlertDialog>}
      </div>
      <DataTable
        products={[]}
        selectedProductsIds={selectedProductsIds}
        setSelectedProductsIds={setSelectedProductsIds}
      />
    </div>
  );
}