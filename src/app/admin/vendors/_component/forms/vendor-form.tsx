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


interface VendorFormProps {
    vendor?: any;
}


const VendorForm = ({ vendor }: VendorFormProps) => {
    const translate = useTranslations("Vendors");
    const translateSyseme = useTranslations("System");
    const [loading, setLoading] = useState(false);
    const origin = useOrigin()
    const router = useRouter()


    useEffect(() => {
        if (vendor) {
            form.setValue("firstname", vendor.firstname ?? "");
            form.setValue("lastname", vendor.lastname ?? "");
            form.setValue("company", vendor.company ?? "");
            form.setValue("email", vendor.email ?? "");
            form.setValue("phone", vendor.phone ?? "");
            form.setValue("address", vendor.address ?? "");
            form.setValue("city", vendor.city ?? "");
            form.setValue("state", vendor.state ?? "");
            form.setValue("zip", vendor.zip ?? "");
            form.setValue("country", vendor.country ?? "");
            form.setValue("website", vendor.website ?? "");
        }
    }, []);

    const vendorSchema = z.object({
        firstname: z.string().optional(),
        lastname: z.string().optional(),
        company: z.string().min(1, translate("namerequired")),
        email: z.string().email(translate("emailinvalid")),
        phone: z.string().optional().refine(
            (value) => {
                if (value) {
                    const regex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s]{0,1}[0-9]{1,10}$/;
                    return regex.test(value);
                }
                return true;
            },
            {
                message: translate("phoneinvalid"),
            }),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        country: z.string().optional(),
        website: z.string().optional(),
    })

    type VendorFormValues = z.infer<typeof vendorSchema>;

    const form = useForm<VendorFormValues>({
        resolver: zodResolver(vendorSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            company: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "",
            website: "",
        },
    });

    const onSubmit = async (data: VendorFormValues) => {
        // const add = await createProduct(data)
        if (!origin) return
        setLoading(true);


        const formData = new FormData();

        formData.append("firstname", data.firstname ?? "");
        formData.append("lastname", data.lastname ?? "");
        formData.append("company", data.company ?? "");
        formData.append("email", data.email ?? "");
        formData.append("phone", data.phone ?? "");
        formData.append("address", data.address ?? "");
        formData.append("city", data.city ?? "");
        formData.append("state", data.state ?? "");
        formData.append("zip", data.zip ?? "");
        formData.append("country", data.country ?? "");
        formData.append("website", data.website ?? "");

        let res;
        if (!vendor) {
            res = await axios.post(origin + "/api/admin/vendors", formData);
        } else {
            res = await axios.put(origin + "/api/admin/vendors/" + vendor?.id, formData);
        }

        if (res.data.status === 200) {
            toast.success(res.data.data.message);
            form.reset();
            setLoading(false);
            router.push(origin + "/admin/vendors")
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
                <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                    {/* First Name */}
                    <FormField
                        control={form.control}
                        name="firstname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{translate("firstname")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={translate("firstnameplaceholder")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{translate("lastname")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={translate("lastnameplaceholder")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                    {/* Company */}
                    <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{translate("company")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={translate("companyplaceholder")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{translate("email")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={translate("emailplaceholder")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                    {/* Phone */}
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{translate("phone")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={translate("phoneplaceholder")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Address */}
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{translate("address")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={translate("addressplaceholder")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                    {/* City */}
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{translate("city")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={translate("cityplaceholder")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* State */}
                    <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{translate("state")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={translate("stateplaceholder")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                    {/* Zip */}
                    <FormField
                        control={form.control}
                        name="zip"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{translate("zip")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={translate("zipplaceholder")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Country */}
                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{translate("country")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={translate("countryplaceholder")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Website */}
                    <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{translate("website")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={translate("websiteplaceholder")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Submit Button */}
                <Button type="submit" className={`w-full mt-4`}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {vendor ? translate("updatevendor") : translate("addvendor")}
                </Button>
            </form>
            <div className="w-full h-20"></div>
        </Form>
    )
}

export default VendorForm
