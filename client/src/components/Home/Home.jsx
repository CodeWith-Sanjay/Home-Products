import React from 'react'
import HomeImage from './HomeImage';
import HomeContent from './HomeContent';


const Home = () => {
  return (
    <div className="w-full pt-28  md:pt-45 px-4 md:px-12 bg-gray-50">
      <HomeImage />
      <div className="mt-12">
        <HomeContent />
      </div>
    </div>
  );
};

export default Home
