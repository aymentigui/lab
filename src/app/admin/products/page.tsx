import React from 'react'
import { accessPage, withAuthorizationPermission,verifySession} from '@/actions/permissions';
import AddRouteButton from '@/components/my/button/add-route-button';
import { Card } from '@/components/ui/card';
import ProductsPageList from './_component/list-products';
const ProductsPage = async () => {

  const session = await verifySession()

  if (session.status !== 200 || !session || !session.data.user || !session.data.user.id) {
    return null;
  }
  await accessPage(['products_view'],session.data.user.id);
  const hasPermissionView = await withAuthorizationPermission(['products_view'],session.data.user.id);
  const hasPermissionAdd = await withAuthorizationPermission(['products_create'],session.data.user.id);

  return (
    <Card className='p-4'>
      <div className='flex flex-col gap-2'>
        {hasPermissionAdd.data.hasPermission && <AddRouteButton translationName="Products" translationButton="addproduct" route="/admin/products/product" />}
        {hasPermissionView.data.hasPermission && <ProductsPageList />}
      </div>
    </Card>
  )
}

export default ProductsPage
