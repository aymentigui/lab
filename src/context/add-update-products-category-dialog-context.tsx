"use client";

import { createContext, useContext, useState } from "react";

type ProductsCategory = {
  id: string;
  name: string;
};

type DialogContextType = {
  isOpen: boolean;
  isAdd: boolean;
  productsCategory?: ProductsCategory;
  openDialog: (isAdd?: boolean, user?: ProductsCategory) => void;
  closeDialog: () => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const AddUpdateProductsCategoryDialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdd, setIsAdd] = useState(true);
  const [productsCategory, setProductsCategory] = useState<ProductsCategory>();

  const openDialog = (isAdd?: boolean, productsCategory?: ProductsCategory) => {
    if (isAdd !== undefined) setIsAdd(isAdd);
    if (productsCategory) setProductsCategory(productsCategory)
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setIsAdd(true);
    setProductsCategory(undefined);
  };

  return (
    <DialogContext.Provider value={{ isOpen, isAdd, productsCategory, openDialog, closeDialog }}>
      {children}
    </DialogContext.Provider>
  );
};

export const useAddUpdateProductsCategoryDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};