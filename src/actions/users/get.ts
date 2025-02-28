"use server"

import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { withAuthorizationPermission, verifySession } from "../permissions";


export async function getUsers(page: number = 1, pageSize: number = 10, searchQuery?: string): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const session = await verifySession()
        if (!session || session.status != 200) {
            return { status: 401, data: { message: e('unauthorized') } }
        }
        const hasPermissionAdd = await withAuthorizationPermission( ['users_view']);

        if (hasPermissionAdd.status != 200 || !hasPermissionAdd.data.hasPermission) {
            return { status: 403, data: { message: e('forbidden') } };
        }

        // Calculer le nombre d'éléments à sauter
        const skip = (page - 1) * pageSize;

        const searchConditions = searchQuery && searchQuery !==""
            ? {
                OR: [
                    { firstname: { contains: searchQuery } },
                    { lastname: { contains: searchQuery } },
                    { username: { contains: searchQuery } },
                    { email: { contains: searchQuery } },
                ],
            }
            : {};

        const users = await prisma.user.findMany({
            skip: skip, // Nombre d'éléments à sauter
            take: pageSize, // Nombre d'éléments à prendre
            where: searchConditions,
            select: {
                id: true,
                firstname: true,
                lastname: true,
                username: true,
                email: true,
                image: true,
                imageCompressed: true,
                isAdmin: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        const formattedUsers = users.map((user) => ({
            ...user,
            roles: user.roles.map((role) => role.role.name),
        }));

        return { status: 200, data: formattedUsers };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { status: 500, data: null };
    }
}


export async function getUser(userId?: string): Promise<{ status: number, data: any }> {
    
    const e = await getTranslations('Error');
    try {

        const session = await verifySession()
        if (!session || session.status != 200) {
            return { status: 401, data: { message: e('unauthorized') } }
        }

        const id = userId ?? session.data.user.id

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return { status: 400, data: { message: e("usernotfound") } };
        }

        return { status: 200, data: user };
    } catch (error) {
        console.error("An error occurred in getUserByid");
        return { status: 500, data: { message: e("error") } };
    }
}


export async function getCountUsers(searchQuery?: string): Promise<{ status: number, data: any }> {

    const searchConditions = searchQuery && searchQuery !==""
    ? {
        OR: [
            { firstname: { contains: searchQuery } },
            { lastname: { contains: searchQuery } },
            { username: { contains: searchQuery } },
            { email: { contains: searchQuery } },
        ],
    }
    : {};

    const e = await getTranslations('Error');
    try {
        const count = await prisma.user.count(
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

export async function getUserByid(id: string): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return { status: 400, data: { message: e("usernotfound") } };
        }
        return { status: 200, data: user };
    } catch (error) {
        console.error("An error occurred in getUserByid");
        return { status: 500, data: { message: e("error") } };
    }
}



export async function getUserByEmailOrUsername(emailOrUsername: string): Promise<{ status: number, data: any }> {
    const e = await getTranslations('Error');
    try {
        const user = await prisma.user.findFirst(
            { where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] } }
        );
        if (!user) {
            return { status: 400, data: { message: e("usernotfound") } };
        }
        return { status: 200, data: user };
    } catch (error) {
        console.error("An error occurred in getUserByid");
        return { status: 500, data: { message: e("error") } };
    }
}
