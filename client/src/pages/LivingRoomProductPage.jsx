import React from 'react'

import Navbar from '../components/Navbar/Navbar'
import MoreProducts from '../components/FeaturedProducts/MoreProducts'
import LivingRoomProducts from '../components/FeaturedProducts/LivingRoomProducts'
import Footer from '../components/Footer/Footer'


const LivingRoomProductPage = () => {
  return (
    <div>
      <div>
      <Navbar />

      <div className='mt-5  md:mt-0 pt-28 md:pt-40'>
      <LivingRoomProducts />
      <MoreProducts />
      <Footer />
      </div>

    </div>
    </div>
  )
}

export default LivingRoomProductPage
