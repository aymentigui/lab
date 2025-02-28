"use server"
import { ChartColumnStacked, CircleEllipsis, CirclePlus, FileSpreadsheet, Home, Newspaper, PillBottle, Settings, UserRoundCog, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getUserPermissions, verifySession } from "./permissions";


const itemsMenu = async () => {
    const Menu = await getTranslations('Menu');
    const items = [
        {
            title: Menu('home'),
            url: "/admin",
            icon: Home,
            admin: false,
            permissions: [],
        },
        {
            title: Menu("users"),
            url: "/admin/users",
            icon: Users,
            admin: false,
            permissions: ["users_view"],
        },
        {
            title: Menu("roles"),
            url: "/admin/roles",
            icon: UserRoundCog,
            admin: false,
            permissions: ["roles_view"],
        },
        {
            title: Menu("products"),
            url: "/admin/products",
            icon: PillBottle,
            admin: false,
            permissions: ["products_view"],
            subItems: [
                {
                    title: Menu("products"),
                    url: "/admin/products",
                    icon: PillBottle,
                    admin: false,
                    permissions: ["products_view"],
                },
                {
                    title: Menu("products_add"),
                    url: "/admin/products/product",
                    icon: CirclePlus,
                    admin: false,
                    permissions: [],
                },
                {
                    title: Menu("products_categories"),
                    url: "/admin/products/categories",
                    icon: ChartColumnStacked,
                    admin: false,
                    permissions: [],
                }
            ],
        },
        {
            title: Menu("vendors"),
            url: "/admin/vendors",
            icon: PillBottle,
            admin: false,
            permissions: ["vendors_view"],
            subItems: [
                {
                    title: Menu("vendors"),
                    url: "/admin/vendors",
                    icon: PillBottle,
                    admin: false,
                    permissions: ["vendors_view"],
                },
                {
                    title: Menu("vendors_add"),
                    url: "/admin/vendors/vendor",
                    icon: CirclePlus,
                    admin: false,
                    permissions: [],
                },
            ],
        },
        // {
        //     title: Menu("more"),
        //     url: null,
        //     icon: CircleEllipsis,
        //     admin: false,
        //     permissions: [],
        //     subItems: [
        //         {
        //             title: Menu("testimportsheet"),
        //             url: "/admin/more/import-sheet",
        //             icon: FileSpreadsheet,
        //             admin: false,
        //             permissions: [],
        //         },
        //         {
        //             title: Menu("fileslocalstorage"),
        //             url: "/admin/more/upload-files",
        //             icon: FileSpreadsheet,
        //             admin: false,
        //             permissions: [],
        //         },
        //         {
        //             title: Menu("pdfutil"),
        //             url: "/admin/more/pdf-util",
        //             icon: FileSpreadsheet,
        //             admin: false,
        //             permissions: [],
        //         },
        //     ],
        // },
        // {
        //     title: Menu("blog"),
        //     url: "/admin/blogs",
        //     icon: Newspaper,
        //     admin: false,
        //     permissions: [],
        // },
        {
            title: Menu("settings"),
            url: "/admin/settings",
            icon: Settings,
            admin: false,
            permissions: [],
        },
    ]
    return items
}

export async function getMenuItems() {
    const items = await itemsMenu()

    const session = await verifySession();
    if (!session || !session.data || !session.data.user) return []

    if (session.data.user.isAdmin) return items

    const permissions = await getUserPermissions(session.data.user.id)
    if (!permissions || permissions.status !== 200 || !permissions.data) return []

    const userPermissions = permissions.data

    const filteredItems = (items: any) => {
        return items.filter((item: any) => {
            if (item.admin) return false;

            if (!item.permissions.every((permission: string) => userPermissions.includes(permission))) return false;
            if (item.subItems) {
                item.subItems = filteredItems(item.subItems); // Filtre récursif des sous-menus
                // Si après filtrage, il n'y a plus de sous-menus valides, on filtre l'élément parent
                if (item.subItems.length === 0) return false;
            }

            // On vérifie que l'utilisateur a toutes les permissions requises pour cet élément
            return item.permissions.every((permission: string) => userPermissions.includes(permission));
        });
    };

    const newItems = filteredItems(items);
    return newItems
} 
