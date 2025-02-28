import type { Metadata } from "next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import DivAdmin from "@/components/my/admin/div-admin";
import HeaderAdmin from "@/components/my/admin/header";
import { AddUpdateUserDialog } from "@/modals/add-update-user-dialog";
import { AddUpdateUserDialogProvider } from "@/context/add-update-user-dialog-context";
import { AddUpdateProductsCategoryDialogProvider } from "@/context/add-update-products-category-dialog-context";
import { AddUpdateProductsCategoryDialog } from "@/modals/add-update-products-category-dialog";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <div>
      <SidebarProvider >
        <DivAdmin />
        <AppSidebar />
        <AddUpdateUserDialogProvider>
          <AddUpdateProductsCategoryDialogProvider>
            <main className="flex min-h-screen flex-col w-full overflow-auto bg-border">
              <HeaderAdmin>
                <SidebarTrigger />
              </HeaderAdmin>
              <div className="w-full p-4 flex-grow">
                {children}
                <AddUpdateUserDialog />
                <AddUpdateProductsCategoryDialog />
              </div>
            </main>
          </AddUpdateProductsCategoryDialogProvider>
        </AddUpdateUserDialogProvider>
      </SidebarProvider>
    </div>
  );
}
