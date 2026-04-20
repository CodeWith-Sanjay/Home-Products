import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { homeCarouselData } from "../../data/HomeCarouselData";
import { scrollToSection } from "../../utils/scrollToSection";

const HomeImage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === homeCarouselData.length - 1 ? 0 : prev + 1
      );
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[420px] md:h-[600px] rounded-3xl overflow-hidden shadow-xl"
    >
      {homeCarouselData.map((home, index) => (
        <div
          key={home.id}
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            index === currentSlide
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105 pointer-events-none"
          }`}
        >
          <img
            src={home.image}
            className="w-full h-full object-cover"
            alt="slide"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
            <p className="text-white text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg">
              {home.quote1}
            </p>

            <p className="text-white text-3xl md:text-5xl font-bold mt-2 drop-shadow-lg">
              {home.quote2}
            </p>

            <button
              onClick={() => scrollToSection("shop", navigate)}
              className="mt-6 w-fit bg-white/90 text-black px-6 py-3 rounded-full font-semibold
                         hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-md"
            >
              Explore Shop
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeImage;
