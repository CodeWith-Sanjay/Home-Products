import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import Cart from '../components/Cart/Cart'
import MoreProducts from '../components/FeaturedProducts/MoreProducts'

const CartPage = () => {
  return (
    <div>
      <Navbar />
      
      <div className='mt-5  md:mt-0 pt-28 md:pt-40'>
      <Cart />
      <Footer />
      </div>

    </div>
  )
}

export default CartPage
