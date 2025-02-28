"use server"
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { uploadFile } from "./upload";
import { generateRandomFilename, getFileExtension } from "../util/util-public";

export async function uploadFileDB(file:File, userId : string) : Promise<{ status: number, data: { message?: string, file?: any } }> {
    const s = await getTranslations("System");
    const f = await getTranslations("Files");
    const e = await getTranslations('Error');

    try {
        if(!file){
            return { status: 400, data: { message: e('badrequest') } }
        }

        const filename= generateRandomFilename()

        if(file.size>10000000){
            return { status: 400, data: { message: f('filesizemax')+"1 mo" } }
        }

        const fileUploaded = await uploadFile("uploads/"+filename+"."+getFileExtension(file.name), file)
        if (fileUploaded.status !== 200 || !fileUploaded.data?.path) {
            if(fileUploaded.status === 409){
                return { status: 409, data: { message: f("fileexists") } };
            }
            return { status: 500, data: { message: e('error') } };
        }

        const fileCreated = await prisma.files.create({
            data: {
                name: filename,
                mimeType: file.type,
                size: file.size,
                extention : getFileExtension(file.name),
                path: fileUploaded.data.path,
                addedFrom: userId,
                canViewUsers: userId,
                canDownloadUsers: userId,
                canDeleteUsers: userId
            },
        })

        return { status: 200, data: { message: s("createsuccess"), file: fileCreated } };
    } catch (error) {
        console.error("An error occurred in createUser" + error);
        return { status: 500, data: { message: s("createfail") } };
    }
}