"use server"
import { verifySession, withAuthorizationPermission } from "@/actions/permissions";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";

export async function getProducts(page: number = 1, pageSize: number = 10, searchQuery?: string): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const session = await verifySession()
        if (!session || session.status != 200) {
            return { status: 401, data: { message: e('unauthorized') } }
        }
        const hasPermissionAdd = await withAuthorizationPermission(['products_view'], session.data.user.id);

        if (hasPermissionAdd.status != 200 || !hasPermissionAdd.data.hasPermission) {
            return { status: 403, data: { message: e('forbidden') } };
        }

        // Calculer le nombre d'éléments à sauter
        const skip = (page - 1) * pageSize;

        const searchConditions = searchQuery && searchQuery !== ""
            ? {
                OR: [
                    { name: { contains: searchQuery } },
                ],
            }
            : {};

        const products = await prisma.products.findMany({
            skip: skip, // Nombre d'éléments à sauter
            take: pageSize, // Nombre d'éléments à prendre
            where: searchConditions,
            select: {
                id: true,
                name: true,
                description: true,
                expiration_date: true,
                image: true,
                image_compressed: true,
                other_images: true,
                categories: true,
            },
        });


        return { status: 200, data: products };
    } catch (error) {
        console.error("Error fetching getproducts:", error);
        return { status: 500, data: null };
    }
}
export async function getProduct(userId?: string): Promise<{ status: number, data: any }> {

    const e = await getTranslations('Error');
    try {

        const session = await verifySession()
        if (!session || session.status != 200) {
            return { status: 401, data: { message: e('unauthorized') } }
        }

        const id = userId ?? session.data.user.id

        const product = await prisma.products.findUnique({ where: { id }, include: {categories:true} });
        if (!product) {
            return { status: 400, data: { message: e("productnotfound") } };
        }

        return { status: 200, data: product };
    } catch (error) {
        console.error("An error occurred in getProduct");
        return { status: 500, data: { message: e("error") } };
    }
}

export async function getProductsCount(searchQuery?: string): Promise<{ status: number, data: any }> {

    const searchConditions = searchQuery && searchQuery !== ""
        ? {
            OR: [
                { name: { contains: searchQuery } },
                { description: { contains: searchQuery } },
            ],
        }
        : {};

    const e = await getTranslations('Error');
    try {
        const count = await prisma.products.count(
            {
                where: searchConditions,
            }
        );
        return { status: 200, data: count };
    } catch (error) {
        console.error("Error fetching count users:", error);
        return { status: 500, data: null };
    }
}