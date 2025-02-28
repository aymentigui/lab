import React from 'react'
import { accessPage, verifySession} from '@/actions/permissions';
import { Card } from '@/components/ui/card';
import ProductForm from '../_component/forms/product-form';
import { getProductsCategories } from '@/actions/products/categories/get';
const AddProductPage = async () => {

  const session = await verifySession()

  if (session.status !== 200 || !session || !session.data.user || !session.data.user.id) {
    return null;
  }
  await accessPage(['products_create'],session.data.user.id);

  const resCategories= await getProductsCategories()
  let productsCategories=[]
  if(resCategories.status===200 && resCategories.data)
    productsCategories=resCategories.data

  return (
    <Card className='p-4'>
      <div className='flex flex-col gap-2'>
        <ProductForm categories={productsCategories} />
      </div>
    </Card>
  )
}

export default AddProductPage
