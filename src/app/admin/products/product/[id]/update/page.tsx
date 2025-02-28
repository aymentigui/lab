import React from 'react'
import { accessPage, verifySession } from '@/actions/permissions';
import { Card } from '@/components/ui/card';
import ProductForm from '../../../_component/forms/product-form';
import { getProduct } from '@/actions/products/products/get';
import { getProductsCategories } from '@/actions/products/categories/get';
const AddProductPage = async ({ params }: any) => {

    const session = await verifySession()

    if (session.status !== 200 || !session || !session.data.user || !session.data.user.id) {
        return null;
    }
    await accessPage(['products_update'], session.data.user.id);

    const paramsID = await params;

    if (!paramsID.id)
        return null

    const resCategories = await getProductsCategories()
    let productsCategories = []
    if (resCategories.status === 200 && resCategories.data)
        productsCategories = resCategories.data

    const res = await getProduct(paramsID.id)
    let product = null
    if (res.status === 200 && res.data) {
        product = res.data
    }

    return (
        <Card className='p-4'>
            <div className='flex flex-col gap-2'>
                <ProductForm product={product} categories={productsCategories} />
            </div>
        </Card>
    )
}

export default AddProductPage
