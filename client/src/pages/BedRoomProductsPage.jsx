import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import MoreProducts from '../components/FeaturedProducts/MoreProducts'
import BedRoomProducts from '../components/FeaturedProducts/BedRoomProducts'

const BedRoomProductsPage = () => {
  return (
    <div>
      <Navbar />

      <div className='mt-5  md:mt-0 pt-28 md:pt-40'>
      <BedRoomProducts />
      <MoreProducts />
      <Footer />
      </div>

    </div>
  )
}

export default BedRoomProductsPage
