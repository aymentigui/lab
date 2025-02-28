"use string";

import { prisma } from "@/lib/db";

export async function getFileId(fileName: string) {
    try{
        const file= await prisma.files.findFirst({ where: { name: fileName } })
        return file
    }catch{
        return null
    }
}