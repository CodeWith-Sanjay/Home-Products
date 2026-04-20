import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import MoreProducts from '../components/FeaturedProducts/MoreProducts'
import KitchenProducts from '../components/FeaturedProducts/KitchenProducts'

const KitchenProductsPage = () => {
  return (
    <div>
      <Navbar />

      <div className='mt-5  md:mt-0 pt-28 md:pt-40'>
      <KitchenProducts />
      <MoreProducts />
      <Footer />
      </div>

    </div>
  )
}

export default KitchenProductsPage
