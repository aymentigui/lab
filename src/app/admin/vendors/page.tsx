import React from 'react'
import { accessPage, withAuthorizationPermission,verifySession} from '@/actions/permissions';
import AddRouteButton from '@/components/my/button/add-route-button';
import { Card } from '@/components/ui/card';
import VendorsPageList from './_component/list-vendors';
const VendorsPage = async () => {

  const session = await verifySession()

  if (session.status !== 200 || !session || !session.data.user || !session.data.user.id) {
    return null;
  }
  await accessPage(['vendors_view'],session.data.user.id);
  const hasPermissionView = await withAuthorizationPermission(['vendors_view'],session.data.user.id);
  const hasPermissionAdd = await withAuthorizationPermission(['vendors_create'],session.data.user.id);

  return (
    <Card className='p-4'>
      <div className='flex flex-col gap-2'>
        {hasPermissionAdd.data.hasPermission && <AddRouteButton translationName="Vendors" translationButton="addvendor" route="/admin/vendors/vendor" />}
        {hasPermissionView.data.hasPermission && <VendorsPageList />}
      </div>
    </Card>
  )
}

export default VendorsPage
