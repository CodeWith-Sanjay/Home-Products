import React from 'react'
import { useNavigate } from 'react-router-dom';

import { HomeContentExamples } from '../../data/HomeContentData';

const HomeContent = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-10">
      {HomeContentExamples.map((home) => (
        <div
          key={home.id}
          className="relative group rounded-2xl overflow-hidden shadow-lg"
        >
          <img
            src={home.image}
            alt={home.title}
            className="w-full h-[320px] object-cover group-hover:scale-110 transition duration-700"
          />

          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/60 transition duration-500" />

          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-5 opacity-0 group-hover:opacity-100 transition duration-500">
            <p className="text-sm uppercase tracking-widest text-gray-200">
              {home.quotes}
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              {home.title}
            </h2>

            <p className="text-sm text-gray-200 mt-3 max-w-[80%]">
              {home.description}
            </p>

            <button
              onClick={() =>
                navigate(`/${home.title.toLowerCase()}-products`)
              }
              className="mt-5 px-6 py-2 rounded-full bg-white text-black font-semibold
                         hover:bg-blue-600 hover:text-white transition"
            >
              Shop Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeContent
