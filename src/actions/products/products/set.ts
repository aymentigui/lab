"use server"
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { verifySession, withAuthorizationPermission } from "@/actions/permissions";
import { compressImage } from "@/actions/util/util";
import { uploadFileDB } from "@/actions/localstorage/upload-db";


export async function createProduct(data: any) {
    const translate = await getTranslations("Products");
    const s = await getTranslations("System");
    const e = await getTranslations('Error');
    const f = await getTranslations('Files');

    const productSchema = z.object({
        name: z.string().min(1, translate("namerequired")),
        description: z.string().optional(),
        expiration_date: z.date().optional(),
        categories: z.array(z.string()).optional(),
        image_principal: z
            .instanceof(File, { message: translate("imageinvalid") })
            .optional()
            .refine((file) => !file || file.type.startsWith("image/"), {
                message: translate("onlyimagesallowed"),
            }),
        images: z.array(z.instanceof(File, { message: translate("imageinvalid") }).refine((file) => file.type.startsWith("image/"), {
            message: translate("onlyimagesallowed"),
        })),
    })

    try {
        const session = await verifySession()
        if (!session || session.status != 200) {
            return { status: 401, data: { message: e('unauthorized') } }
        }
        const hasPermissionAdd = await withAuthorizationPermission(['products_create'], session.data.user.id);

        if (hasPermissionAdd.status != 200 || !hasPermissionAdd.data.hasPermission) {
            return { status: 403, data: { message: e('forbidden') } };
        }
        const result = productSchema.safeParse(data);

        if (!result.success) {
            console.log(result.error.errors);
            return { status: 400, data: { errors: result.error.errors } };
        }
        const { name, description, expiration_date, image_principal, images, categories } = result.data;

        const usernameExists = await prisma.products.findFirst({ where: { name } });
        if (usernameExists) {
            return { status: 400, data: { message: translate("nameexist") } };
        }

        let imageId = null
        let imageCompressedUrl = null
        if (image_principal && image_principal.size > 0) {
            if (image_principal?.size > 10000000) {
                return { status: 400, data: { message: f("filesizemax") + "10 mo" } };
            }

            const arrayBuffer = await image_principal.arrayBuffer();

            const result = await compressImage(arrayBuffer, 0.1);
            if (result === null) return { status: 500, data: { message: e("error") } };

            const res = await uploadFileDB(image_principal, session.data.user.id)
            const resCompressed = await uploadFileDB(result, session.data.user.id)

            if (res.status === 200 || res.data.file) imageId = res.data.file.id;
            if (resCompressed.status === 200 || resCompressed.data.file) imageCompressedUrl = resCompressed.data.file.id;
        }

        const otherImagesPromises = images?.map(async (img) => {
            if (img?.size > 10000000) {
                return;
            }
            const res = await uploadFileDB(img, session.data.user.id)
            if (res.status === 200 || res.data.file) {
                return res.data.file.id
            };
        }) || [];

        const otherImages = await Promise.all(otherImagesPromises);
        const otherImagesIds = otherImages.join(",")

        let categoriesProducts: any[] = [];
        if (categories)
            categoriesProducts = categories

        const products = await prisma.products.create({
            data: {
                name,
                description,
                expiration_date,
                other_images:otherImagesIds,
                image: imageId,
                image_compressed: imageCompressedUrl,
                categories: {
                    connect: categoriesProducts.map((id: string) => ({ id })),
                },
            },
        });

        return { status: 200, data: { message: s("createsuccess") } };
    } catch (error) {
        console.error("An error occurred in createproducts" + error);
        return { status: 500, data: { message: s("createfail") } };
    }
}