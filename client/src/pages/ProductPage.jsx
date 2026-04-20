import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import SingleProduct from '../components/FeaturedProducts/SingleProduct'
import MoreProducts from '../components/FeaturedProducts/MoreProducts'

const ProductPage = () => {
  return (
    <div>
      <Navbar />

      <div className='mt-5  md:mt-0 pt-28 md:pt-40'>
      <SingleProduct />
      <MoreProducts />
      <Footer />
      </div>

    </div>
  )
}

export default ProductPage
