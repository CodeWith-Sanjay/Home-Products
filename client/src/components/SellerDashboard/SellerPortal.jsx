import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import SellerPortalNav from './SellerPortalNav'
import SellerSidebar from './SellerSidebar'

const SellerPortal = () => {
  const navigate = useNavigate();


  return (
    <div className="flex h-screen bg-gray-100">
      
      <SellerSidebar />

      <div className="flex flex-col flex-1">
        <SellerPortalNav />
        <div className="p-5 overflow-y-auto">
          <Outlet />
        </div>

      </div>
    </div>
  )
}

export default SellerPortal
