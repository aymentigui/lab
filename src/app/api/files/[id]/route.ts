import { withAuthorizationPermission, verifySession } from "@/actions/permissions";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { deleteFile } from "@/actions/localstorage/delete";

export async function GET(request: Request, { params }: { params: any }) {

    const paramsID = await params
    const url = new URL(request.url);
    const allFile = url.searchParams.get("allFile");

    const f = await getTranslations('Files');
    const e = await getTranslations('Error');

    const fileexists = await prisma.files.findFirst({ where: { id: paramsID.id } });

    if (!fileexists) {
        return NextResponse.json(fileexists);
    }

    if (fileexists?.canViewUsers || fileexists?.adminViewOnly || fileexists?.canViewPermissions) {
        const session = await verifySession();
        let havePermission = false
        if (session.status !== 200 || !session.data || !session.data.user) {
            return NextResponse.json({ message: e("unauthorized") }, { status: 401 });
        }
        if (fileexists.adminViewOnly) {
            if (session.data.user.isAdmin === false) {
                return NextResponse.json({ message: f("unauthorized") }, { status: 401 });
            }else {
                havePermission = true
            }
        }
        if (fileexists.canViewUsers && !havePermission) {
            const users = fileexists.canViewUsers.split(',')
            if (!users.includes(session.data.user.id)) {
                return NextResponse.json({ message: f("unauthorized") }, { status: 401 });
            }else {
                havePermission = true
            }
        }
        if (fileexists.canViewPermissions && !havePermission) {
            const permissions = fileexists.canViewPermissions.split(',')
            const hasPermission = await withAuthorizationPermission(permissions,session.data.user.id);
            if (hasPermission.status !== 200 || !hasPermission.data.hasPermission) {
                return NextResponse.json({ message: f("unauthorized") }, { status: 401 });
            }
        }
    }

    if (allFile === "true") {
        try {
            if (fileexists?.canViewUsers || fileexists?.adminViewOnly || fileexists?.canViewPermissions) {
                const session = await verifySession();
                let havePermission = false
                if (session.status !== 200 || !session.data || !session.data.user) {
                    return NextResponse.json({ message: e("unauthorized") }, { status: 401 });
                }
                if (fileexists.adminDownloadOnly) {
                    if (session.data.user.isAdmin === false) {
                        return NextResponse.json({ message: f("unauthorized") }, { status: 401 });
                    }else {
                        havePermission = true
                    }
                }
                if (fileexists.canDownloadUsers && !havePermission) {
                    const users = fileexists.canDownloadUsers.split(',')
                    if (!users.includes(session.data.user.id)) {
                        return NextResponse.json({ message: f("unauthorized") }, { status: 401 });
                    }else {
                        havePermission = true
                    }
                }
                if (fileexists.canDownloadPermissions && !havePermission) {
                    const permissions = fileexists.canDownloadPermissions.split(',')
                    const hasPermission = await withAuthorizationPermission(permissions,session.data.user.id);
                    if (hasPermission.status !== 200 || !hasPermission.data.hasPermission) {
                        return NextResponse.json({ message: f("unauthorized") }, { status: 401 });
                    }
                }
            }
            // Définition du chemin du fichier
            const filePath = path.join(process.cwd(), fileexists.path);

            // Vérifier si le fichier existe
            if (!fs.existsSync(filePath)) {
                return NextResponse.json({ error: "File not found in storage" }, { status: 200 });
            }

            // Création du stream de lecture
            const fileStream = fs.createReadStream(filePath);

            // Adapter ReadStream en ReadableStream
            const readableStream = new ReadableStream({
                start(controller) {
                    fileStream.on("data", (chunk) => controller.enqueue(chunk));
                    fileStream.on("end", () => controller.close());
                    fileStream.on("error", (err) => controller.error(err));
                },
            });


            // Retourner la réponse avec le stream
            return new Response(readableStream, {
                headers: {
                    "Content-Type": fileexists.mimeType,
                    "X-File-Metadata": JSON.stringify(fileexists),
                },
            });
        } catch (error) {
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }

    return NextResponse.json({ data: fileexists }, { status: 200 });
}



export async function DELETE(request: Request, { params }: { params: any }) {

    const paramsID = await params
    const f = await getTranslations('Files');

    const fileexist = await prisma.files.findFirst({ where: { id: paramsID.id } });

    if (!fileexist) {
        return NextResponse.json({ message: f("filedoesnotexist") }, { status: 404 });
    }

    if (fileexist?.canDeleteUsers || fileexist?.adminDeleteOnly || fileexist?.canDeletePermissions) {
        const session = await verifySession();
        let havePermission = false
        if (session.status !== 200 || !session.data || !session.data.user) {
            return NextResponse.json({ message: f("unauthorized") }, { status: 401 });
        }
        if (fileexist.adminDeleteOnly) {
            if (session.data.user.isAdmin === false) {
                return NextResponse.json({ message: f("unauthorized") }, { status: 401 });
            }else{
                havePermission = true
            }
        }
        if (fileexist.canDeleteUsers && !havePermission) {
            const users = fileexist.canDeleteUsers.split(',')
            if (!users.includes(session.data.user.id)) {
                return NextResponse.json({ message: f("unauthorized") }, { status: 401 });
            }else {
                havePermission = true
            }
        }
        if (fileexist.canDeletePermissions && !havePermission) {
            const permissions = fileexist.canDeletePermissions.split(',')
            const hasPermission = await withAuthorizationPermission(permissions,session.data.user.id);
            if (hasPermission.status !== 200 || !hasPermission.data.hasPermission) {
                return NextResponse.json({ message: f("unauthorized") }, { status: 401 });
            }
        }

        const deletedFile = await prisma.files.delete({ where: { id: paramsID.id } });
        deleteFile(paramsID.id);

        return NextResponse.json({ data: deletedFile }, { status: 200 });
    }
}
