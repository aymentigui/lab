"use server"
import { deleteFileDb } from "@/actions/localstorage/delete-db";
import { getFileId } from "@/actions/localstorage/get";
import { uploadFileDB } from "@/actions/localstorage/upload-db";
import { verifySession, withAuthorizationPermission } from "@/actions/permissions";
import { compressImage } from "@/actions/util/util";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

export async function updateProduct(id: string, data: any, deletedFiles: string[]): Promise<{ status: number, data: any }> {
    const translate = await getTranslations("Products");
    const s = await getTranslations("System");
    const e = await getTranslations('Error');
    const f = await getTranslations("Files")

    try {
        const session = await verifySession()
        if (!session || session.status != 200) {
            return { status: 401, data: { message: e('unauthorized') } }
        }
        const hasPermissionAdd = await withAuthorizationPermission(['products_update'], session.data.user.id);

        if (hasPermissionAdd.status != 200 || !hasPermissionAdd.data.hasPermission) {
            return { status: 403, data: { message: e('forbidden') } };
        }

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

        if (id == "" || id == undefined) return { status: 400, data: { message: translate("productnotfound") } }

        const result = productSchema.safeParse(data);
        if (!result.success) {
            console.log(result.error.errors);
            return { status: 400, data: { errors: result.error.errors } };
        }

        const { name, description, expiration_date, image_principal, images, categories } = result.data;
        
        let categoriesProducts: any[] = [];
        if (categories)
            categoriesProducts = categories

        const product = await prisma.products.update({
            where: { id },
            data: {
                name,
                description,
                expiration_date,
                categories: {
                    connect: categoriesProducts.map((id: string) => ({ id })),
                },
            },
        })


        if (image_principal && image_principal.size > 0) {

            if (product.image)
                await deleteFileDb(product.image)
            if (product.image_compressed)
                await deleteFileDb(product.image_compressed)


            let imageId = null
            let imageCompressedUrl = null
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

            await prisma.products.update({
                where: { id },
                data: {
                    image: imageId,
                    image_compressed: imageCompressedUrl,
                },
            })
        }

        const otherImagesPromises = images?.map(async (img) => {
            if (img?.size > 10000000) {
                return;
            }
            const res = await uploadFileDB(img, session.data.user.id)
            console.log(res)
            console.log("-----------")
            if (res.status === 200 || res.data.file) {
                return res.data.file.id
            };
        }) || [];

        const deletedFilesIds:string[]=[]
        deletedFiles.forEach(async (name) => {
            const file = await getFileId(name)
            if (file){
                deletedFilesIds.push(file.id)
                await deleteFileDb(file.id)
            }
        })

        const otherImages = await Promise.all(otherImagesPromises);
        const otherImagesOld= product.other_images?(product.other_images.split(',')?.filter(img => img)): []
        const otherImagesNew= otherImagesOld.filter(img => !deletedFilesIds.includes(img))
        const otherImagesIds = [...otherImagesNew, ...otherImages.filter(img => img)].join(',')

        await prisma.products.update({
            where: { id },
            data: {
                other_images: otherImagesIds,
            },
        })



        return { status: 200, data: { message: s("updatesuccess") } }
    } catch (error) {
        console.error("An error occurred in updateProduct")
        return { status: 500, data: { message: e("error") } }
    }
}