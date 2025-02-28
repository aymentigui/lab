import { uploadFileDB } from "@/actions/localstorage/upload-db";
import { withAuthorizationPermission, verifySession } from "@/actions/permissions";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {

    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    const f = await getTranslations('Files');
    
    let where  = {}     

    if(type){
        where = [
            {
                type: type
            }
        ]
    }

    const fileexists = await prisma.files.findMany({
        where: where
    })

    if (!fileexists) {
        return NextResponse.json({ message: f("filedoesnotexist") }, { status: 404 });
    }
    const files = [];

    for (const file of fileexists) {

        if (file?.canViewUsers || file?.adminViewOnly || file?.canViewPermissions) {
            const session = await verifySession();
            if (session.status !== 200 || !session.data || !session.data.user) {
                continue
            }
            if (file.adminViewOnly) {
                if (session.data.user.isAdmin === false) {
                    continue
                }
            }
            if (file.canViewUsers) {
                const users = file.canViewUsers.split(',')
                if (!users.includes(session.data.user.id)) {
                    continue
                }
            }
            if (file.canViewPermissions) {
                const permissions = file.canViewPermissions.split(',')
                const hasPermission = await withAuthorizationPermission(permissions, session.data.user.id);
                if (hasPermission.status !== 200 || !hasPermission.data.hasPermission) {
                    continue
                }
            }
        }

        files.push(file)
    }

    return NextResponse.json({ data: files }, { status: 200 });
}


export async function POST(request: NextRequest) { 
    const data = await request.formData();
    const files = data.getAll("file") as File[];

    if (!files.length) {
        return NextResponse.json({ message: "No files found" }, { status: 400 });
    }

    const session = await verifySession();
    if (session.status !== 200 || !session.data || !session.data.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const uploadedFiles = [];
    
    for (const file of files) {
        const newFile = await uploadFileDB(file, session.data.user.id);
        uploadedFiles.push({ data: newFile.data, status: newFile.status });
    }

    return NextResponse.json(uploadedFiles);
}
