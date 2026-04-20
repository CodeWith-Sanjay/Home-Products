import React, { useState } from "react";

import { clientExamples } from "../../data/clientExampleData";

const ClientSection = () => {
  const [index, setIndex] = useState(0);

  const visibleCards = 3;
  const maxIndex = clientExamples.length - visibleCards;

  const nextReview = () => {
    setIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
  };

  const prevReview = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <div
      id="blog"
      className="w-full px-4 md:px-12 py-16 bg-gray-50"
    >
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          What Clients Say
        </h2>

        <div className="flex gap-3">
          <button
            onClick={prevReview}
            className="px-4 py-2 rounded-full bg-gray-800 text-white shadow hover:bg-gray-900 transition"
          >
            ←
          </button>

          <button
            onClick={nextReview}
            className="px-4 py-2 rounded-full bg-gray-800 text-white shadow hover:bg-gray-900 transition"
          >
            →
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out gap-6"
          style={{
            transform: `translateX(-${index * (100 / visibleCards)}%)`,
          }}
        >
          {clientExamples.map((client) => (
            <div
              key={client.id}
              className="min-w-full md:min-w-1/3"
            >
              <div className="h-full bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 border border-gray-100">
                
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {client.name}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {client.date}
                  </span>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  “{client.feedback}”
                </p>

                <div className="mt-4 text-yellow-500 text-sm">
                  ★ ★ ★ ★ ★
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientSection;
