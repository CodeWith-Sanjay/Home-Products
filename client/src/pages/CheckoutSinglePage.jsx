import React from 'react'

import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import CheckoutPage from '../components/CheckoutPage/CheckoutPage'

const CheckoutSinglePage = () => {
  return (
    <div>
      <Navbar />

      <div className='mt-5  md:mt-0 pt-28 md:pt-40'>
      <CheckoutPage />
      <Footer />
      </div>

    </div>
  )
}

export default CheckoutSinglePage
