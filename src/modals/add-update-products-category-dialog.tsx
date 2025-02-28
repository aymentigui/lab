"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useOrigin } from "@/hooks/use-origin";
import { useAddUpdateProductsCategoryDialog } from "@/context/add-update-products-category-dialog-context";
import { AddProductCategory } from "@/actions/products/categories/set";
import { UpdateProductsCategory } from "@/actions/products/categories/update";

type ProductsCategory = {
  id: string;
  name: string;
};


export const AddUpdateProductsCategoryDialog = () => {
  const translate = useTranslations("ProductsCategories");
  const { isOpen, closeDialog, isAdd, productsCategory } = useAddUpdateProductsCategoryDialog();
  const [loading, setLoading] = useState(false);
  const origin = useOrigin()


  const productsCategorySchema = z.object({
    name: z.string().min(1, translate("namerequired")),
  })

  type ProductsCategoryFormValues = z.infer<typeof productsCategorySchema>;

  const form = useForm<ProductsCategoryFormValues>({
    resolver: zodResolver(productsCategorySchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (productsCategory) {
      form.setValue("name", productsCategory.name ?? "");
    }
  }, [productsCategorySchema])

  const onSubmit = async (data: ProductsCategoryFormValues) => {
    if (!origin) return
    setLoading(true);
    let res;
    let message;
    let status;

    if (isAdd) {
      res = await AddProductCategory(data.name);
    } else if(productsCategory) {
      res = await UpdateProductsCategory(productsCategory.id,data.name)
    } else {
      toast.error("Error");
      return
    }
    
    status = res.status;message = res.data.message
    setLoading(false);

    if (status === 200) {
      toast.success(message);
      closeDialog();
      form.reset();
    } else {
      toast.error(message);
    }
  };

  const handleClose = () => {
    closeDialog();
    setLoading(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="!w-[330px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">{isAdd ? translate("addcategory") : translate("updatecategory")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("name")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={translate("nameplaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Submit Button */}
            <Button type="submit" className={`w-full mt-4`}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isAdd ? translate("addcategory") : translate("updatecategory")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};