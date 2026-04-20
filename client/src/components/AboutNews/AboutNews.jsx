import React from "react";

import { newsExamples } from "../../data/AboutNewsData";

const AboutNews = () => {
  return (
    <div
      id="about"
      className="w-full px-4 md:px-12 py-16 bg-gray-50 flex flex-col items-center"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
        Latest News & Updates
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {newsExamples.map((news) => (
          <div
            key={news.id}
            className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 bg-white"
          >
            <div className="relative h-72 overflow-hidden">
              <img
                src={news.image}
                alt={news.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>

            <div className="absolute bottom-0 p-5 text-white">
              <div className="flex items-center gap-2 text-sm text-gray-200 mb-2">
                <span className="font-medium">{news.name}</span>
                <span>•</span>
                <span>{news.date}</span>
              </div>

              <h2 className="text-lg md:text-xl font-semibold leading-snug">
                {news.news}
              </h2>

              <p className="text-sm text-gray-200 mt-2 line-clamp-2">
                {news.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutNews;