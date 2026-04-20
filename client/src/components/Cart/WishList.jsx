import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import { WishListContext } from "../../context/WishListContext/WishListContext";
import { CartContext } from "../../context/CartContext/CartContext";

const WishList = () => {
  const navigate = useNavigate();

  const { cart, addToCart } = useContext(CartContext);
  const { wishList, removeFromWishList } = useContext(WishListContext);

  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (wishList.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-2xl font-semibold text-gray-400">
          Your wishlist is empty
        </p>
      </div>
    );
  }

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <div className="w-full px-6 md:px-12 pt-10 min-h-screen">

      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900">
          Wishlist
        </h1>
        <p className="text-sm text-gray-500">
          Your saved products
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {wishList.map((product) => {
          const isHovered = hovered === product.id;

          return (
            <div
              key={product.id}
              onMouseEnter={() => setHovered(product.id)}
              onMouseLeave={() => setHovered(null)}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => navigate(`/product/${product.slug}`)}
            >

              <div className="relative overflow-hidden">

                <img
                  src={product.thumbnail || "https://via.placeholder.com/400"}
                  alt={product.name}
                  className={`w-full h-64 object-cover transition duration-500 
                  ${isHovered ? "scale-110" : "scale-100"}`}
                />

                <div className={`absolute inset-0 bg-black/20 flex items-center justify-center gap-3 transition-all duration-300
                  ${isHovered ? "opacity-100" : "opacity-0"}
                `}>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="bg-white p-3 rounded-full shadow hover:bg-blue-600 hover:text-white transition"
                  >
                    <ShoppingCartOutlinedIcon />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishList(product);
                    }}
                    className="bg-white p-3 rounded-full shadow hover:bg-red-500 hover:text-white transition"
                  >
                    <DeleteOutlineOutlinedIcon />
                  </button>

                </div>
              </div>

              <div className="p-4 space-y-2">

                <h2 className="text-sm font-medium text-gray-800 line-clamp-2">
                  {product.name}
                </h2>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900">
                    ₹{product.discountPrice}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.price}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-gray-500 pt-1">
                  <span>⭐ {product.rating || 4.5}</span>
                  <span>In Stock</span>
                </div>

              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
};

export default WishList;