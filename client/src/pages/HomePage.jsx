import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import Home from '../components/Home/Home'
import FeaturedProducts from '../components/FeaturedProducts/FeaturedProducts'
import AboutNews from '../components/AboutNews/AboutNews'
import ClientSection from '../components/ClientSection/ClientSection'
import Footer from '../components/Footer/Footer'

const HomePage = () => {
  return (
    <div id='home'>
      <Navbar />
      <Home />
      <FeaturedProducts />
      <AboutNews />
      <ClientSection />
      <Footer />
    </div>
  )
}

export default HomePage
