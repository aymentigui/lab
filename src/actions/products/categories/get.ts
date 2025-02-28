"use server"

import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { withAuthorizationPermission,verifySession } from "../../permissions";

export async function getProductsCategories(): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const session = await verifySession();
        if (!session?.data?.user) {
            return { status: 401, data: { message: e("unauthorized") } };
        }
        const hasPermission = await withAuthorizationPermission(['products_categories_view'],session.data.user.id);

        if(hasPermission.status != 200 || !hasPermission.data.hasPermission) {
            return { status: 403, data: { message: e('forbidden') } };
        }

        const products_categories = await prisma.products_categories.findMany();

        return { status: 200, data: products_categories };
    } catch (error) {
        console.error("An error occurred in getRoles");
        return { status: 500, data: { message: e("error") } };
    }
}

// Get a single role
// muste have permission update
export async function getProductsCategory(id: string): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const session = await verifySession();
        if (!session?.data?.user) {
            return { status: 401, data: { message: e("unauthorized") } };
        }
        const hasPermissionAdd = await withAuthorizationPermission(['products_categories_view'],session.data.user.id);
        
        if(hasPermissionAdd.status != 200 || !hasPermissionAdd.data.hasPermission) {
            return { status: 403, data: { message: e('forbidden') } };
        }
        const products_categories = await prisma.products_categories.findUnique({ where: { id } });
        return { status: 200, data: products_categories };
    } catch (error) {
        console.error("An error occurred in getRole");
        return { status: 500, data: { message: e("error") } };
    }
}