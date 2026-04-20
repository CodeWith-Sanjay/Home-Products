import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import WishList from '../components/Cart/WishList'
import MoreProducts from '../components/FeaturedProducts/MoreProducts'

const WishListPage = () => {
  return (
    <div>
      <Navbar />
      
      <div className='mt-5  md:mt-0 pt-28  md:pt-40'>
      <WishList />
      <MoreProducts />
      <Footer />
      </div>

    </div>
  )
}

export default WishListPage
