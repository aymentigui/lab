import React from 'react'
import { accessPage, verifySession} from '@/actions/permissions';
import { Card } from '@/components/ui/card';
import { getProductsCategories } from '@/actions/products/categories/get';
import VendorForm from '../_component/forms/vendor-form';
import { getTranslations } from 'next-intl/server';
const AddVendorPage = async () => {

  const session = await verifySession()

  if (session.status !== 200 || !session || !session.data.user || !session.data.user.id) {
    return null;
  }
  await accessPage(['vendors_create'],session.data.user.id);

  const translate = await getTranslations("Vendors")

  return (
    <Card className='p-4'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-2xl font-bold m-4 underline underline-offset-8'>{translate("addvendor")}</h1>
        <VendorForm />
      </div>
    </Card>
  )
}

export default AddVendorPage
