import { accessPage, withAuthorizationPermission,verifySession} from '@/actions/permissions';
import AddModalButton from '@/components/my/button/add-modal-button';
import { Card } from '@/components/ui/card';
import React from 'react'
import ProductsCategoriesPageList from '../_component/list-products-categories';
import { useAddUpdateProductsCategoryDialog } from '@/context/add-update-products-category-dialog-context';
import { getProductsCategories } from '@/actions/products/categories/get';

const ProductsCategoriesPage = async () => {

  const session = await verifySession()

  if (session.status !== 200 || !session || !session.data.user || !session.data.user.id) {
    return null;
  }
  await accessPage(['categories_view'],session.data.user.id);
  const hasPermissionView = await withAuthorizationPermission(['products_categories_view'],session.data.user.id);
  const hasPermissionAdd = await withAuthorizationPermission(['products_categories_create'],session.data.user.id);

  let categories=[]
  if(hasPermissionView){
    const res= await getProductsCategories()
    if(res.status===200 && res.data)
      categories=res.data
  }

  return (
    <Card className='p-4'>
      <div className='flex flex-col gap-2'>
        {hasPermissionAdd.data.hasPermission && <AddModalButton translationName="ProductsCategories" translationButton="addcategory" useModal={useAddUpdateProductsCategoryDialog} />}
        {hasPermissionView.data.hasPermission && <ProductsCategoriesPageList productsCategories={categories} />}
      </div>
    </Card>
  )
}

export default ProductsCategoriesPage
