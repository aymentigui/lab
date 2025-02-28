"use client"
import { getProductsCategories } from '@/actions/products/categories/get';
import AvatarUploader from '@/components/myui/avata-uploader';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select from "react-select";
import { Input } from '@/components/ui/input';
import { useOrigin } from '@/hooks/use-origin';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from "date-fns"
import { FileDropzone } from '@/components/myui/file-dropzone';
import { createProduct } from '@/actions/products/products/set';
import { useRouter } from 'next/navigation';
import { getFileFromLocalHost } from '@/actions/localstorage/util-client';

type ProductsCategories = {
    id: string;
    name: string;
}

interface ProductFormProps {
    product?: any;
    categories: ProductsCategories[];
}


const ProductForm = ({ product, categories }: ProductFormProps) => {
    const translate = useTranslations("Products");
    const translateFiles = useTranslations("Files")
    const translateSyseme = useTranslations("System");
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const origin = useOrigin()
    const router = useRouter()
    const [files, setFiles] = useState<File[] | []>([])

    const acceptedFileTypes = {
        'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
    }

    useEffect(() => {
        if (product) {
            form.setValue("name", product.name ?? "");
            form.setValue("description", product.description ?? "");
            form.setValue("expiration_date", product.expiration_date ?? undefined);
            form.setValue("categories", product.categories ?? []);
            form.setValue("categories", categories.filter((categorie) => product.categories.some((productCategorie: any) => productCategorie.name === categorie.name)).map((categorie: any) => { return categorie.id }));
            setImage(product.image ?? null);

            product.other_images.split(",").forEach((file: any) => {
                getFileFromLocalHost(file, origin + "/api/files/").then((val) => {
                    console.log(val)
                    if (val) {
                        form.setValue("images", [...form.getValues("images"), val]);
                        setFiles((p) => [...p, val])
                    }
                })
            })
        }
    }, []);

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

    type ProductFormValues = z.infer<typeof productSchema>;

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            expiration_date: undefined,
            categories: [],
            image_principal: undefined,
            images: [],
        },
    });

    const handleRemoveFile = (event: React.MouseEvent, file: File) => {
        event.stopPropagation()
        form.setValue(
            'images',
            form.getValues('images')?.filter((f) => f !== file)
        );
    }


    const onSubmit = async (data: ProductFormValues) => {
        // const add = await createProduct(data)
        if (!origin) return
        setLoading(true);


        const formData = new FormData();
        if (data.image_principal) {
            formData.append("file", data.image_principal);
        }
        if (data.images.length > 0) {
            data.images.forEach((image) => {
                console.log(files)
                if (!files.some((file) => file.name === image.name && file.size === image.size)) {
                    formData.append("files", image);
                }
            });
        }
        if (product) {
            data.images.forEach((image) => {
                if (files.some((file) => file.name === image.name && file.size === image.size)) {
                    formData.append("filesdelete", image.name);
                }
            });
        }

        formData.append("name", data.name);
        formData.append("description", data.description ?? "");
        if (data.expiration_date){
            formData.append("expiration_date", data.expiration_date.toISOString());
        }
        if (data.categories)
            formData.append("categories", JSON.stringify(data.categories));

        let res;
        if (!product) {
            res = await axios.post(origin + "/api/admin/products", formData);
        } else {
            res = await axios.put(origin + "/api/admin/products/" + product?.id, formData);
        }

        if (res.data.status === 200) {
            toast.success(res.data.data.message);
            form.reset();
            setLoading(false);
            router.push(origin + "/admin/products")
        } else {
            setLoading(false);
            if (res.data.data.errors) {
                res.data.data.errors.map((err: any) => {
                    toast.error(err.message);
                })
            } else {
                toast.error(res.data.data.message);
            }
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <AvatarUploader name="image_principal" image={image} circle={false} size='w-48 h-48' />
                <div className="grid grid-cols-2 gap-4">
                    {/* First Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{translate("name")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={translate("nameplaceholder")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{translate("description")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={translate("descriptionplaceholder")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="expiration_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col justify-center">
                                <FormLabel>{translate("dateexpiration")}</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "dd-MM-yyyy")
                                                ) : (
                                                    <span>{translateSyseme("pickdate")}</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date: any) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="categories"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{translate("categories")}</FormLabel>
                                <FormControl>
                                    <Select
                                        isMulti
                                        options={
                                            categories?.map((productsCategorie) => ({
                                                value: productsCategorie.id,
                                                label: productsCategorie.name,
                                            }))
                                        }
                                        value={field.value?.map((productsCategorie) => ({
                                            value: productsCategorie,
                                            label: categories?.find((r) => r.id === productsCategorie)?.name,
                                        }))}
                                        onChange={(selectedOptions) => {
                                            field.onChange(
                                                selectedOptions.map((option) => option.value)
                                            );
                                        }}
                                        placeholder={translate("categoryplaceholder")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{translate("images")}</FormLabel>
                            <FormControl>
                                <FileDropzone
                                    onFilesSelected={(files) => field.onChange(
                                        field.value.find(file => file.name === files[0].name) ? field.value : [...field.value, ...files]
                                    )}
                                    value={field.value}
                                    accept={acceptedFileTypes}
                                    multiple={true}
                                    onRemove={handleRemoveFile}
                                />
                            </FormControl>
                            <FormDescription>
                                {translateFiles("selectoneormorefiles")}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Submit Button */}
                <Button type="submit" className={`w-full mt-4`}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {product?translate("updateproduct"):translate("addproduct")}
                </Button>
            </form>
            <div className="w-full h-20"></div>
        </Form>
    )
}

export default ProductForm
