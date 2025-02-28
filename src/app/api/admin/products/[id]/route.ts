import { updateProduct } from "@/actions/products/products/update";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: any }) {

    const paramsID = await params

    const data = await request.formData();
    let image_principal = data.get("file") as unknown as File;
    if (!image_principal)
        image_principal = new File([], "default.png", { type: "image/png" });
    let images = data.getAll("files") as unknown as File[];
    
    const name = data.get("name") as string;
    const description = data.get("description") as string;
    const expiration_date = data.get("expiration_date")?new Date(data.get("expiration_date") as string):undefined;
    const categories = JSON.parse(data.get("categories") as string);
    const filesdelete = data.getAll("filesdelete") as unknown as string[]??[];

    const res = await updateProduct(paramsID.id, { name, description, expiration_date, image_principal, images, categories },filesdelete)


    return NextResponse.json(res);
}
