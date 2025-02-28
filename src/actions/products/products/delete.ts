"use server"

import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { verifySession, withAuthorizationPermission } from "@/actions/permissions";
import { deleteFileDb } from "@/actions/localstorage/delete-db";

export async function deleteProducts(ids: string[]): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    const s = await getTranslations('System');
    try {
        const session = await verifySession()
        if (!session || session.status != 200) {
            return { status: 401, data: { message: e('unauthorized') } }
        }
        const hasPermissionAdd = await withAuthorizationPermission(['products_delete'], session.data.user.id);

        if (hasPermissionAdd.status != 200 || !hasPermissionAdd.data.hasPermission) {
            return { status: 403, data: { message: e('forbidden') } };
        }

        const products = await prisma.products.findMany({
            where: {
                id: {
                    in: ids
                }
            }
        })

        products.map(async (product) => {
            product.image && await deleteFileDb(product.image)
            product.image_compressed && await deleteFileDb(product.image_compressed)
            const otherImages = product.other_images?.split(',')?.filter(img => img) || []
            if (otherImages)
                otherImages.forEach(async (img) => {
                    await deleteFileDb(img)
                })
        })

        await prisma.products.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        })
        return { status: 200, data: { message: s('deletesuccess') } }
    } catch (error) {
        // @ts-ignore
        console.error(error.message);
        return { status: 500, data: { message: e('error') } }
    }
}