import { createProduct } from "@/actions/products/products/set";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

    const data= await request.formData();
    let image_principal = data.get("file") as unknown as File;
    let images = data.getAll("files") as unknown as File[];
    const name = data.get("name") as string;
    const description = data.get("description") as string;
    const expiration_date = data.get("expiration_date")?new Date(data.get("expiration_date") as string):undefined;
    const categories = JSON.parse(data.get("categories") as string);

    const res = await createProduct({ image_principal, name, description, expiration_date, categories, images });

    return NextResponse.json(res);
}