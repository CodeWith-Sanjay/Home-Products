import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProductContext } from "../../context/ProductContext/ProductContext";
import { CartContext } from "../../context/CartContext/CartContext";
import { WishListContext } from "../../context/WishListContext/WishListContext";

import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import CheckIcon from "@mui/icons-material/Check";
import FavoriteBorderSharpIcon from "@mui/icons-material/FavoriteBorderSharp";
import FavoriteIcon from "@mui/icons-material/Favorite";

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [pendingCartIds, setPendingCartIds] = useState(new Set());

  const { cart, addToCart, removeFromCart, deleteItem } = useContext(CartContext);
  const { wishList, addToWishList, removeFromWishList } = useContext(WishListContext);
  const { products } = useContext(ProductContext);

  // Show all products including color variants (each variant is a separate card)
  const limitedProducts = products.slice(0, 12);

  const isInCart = (product) => {
    const productId = product.product_id || product.id;
    const variantId = product.variantId || product.variant_id || null; // variants have variantId; base products don't
    return cart.some(
      (item) =>
        item.product_id === productId &&
        (item.variant_id ?? null) === (variantId ?? null)
    );
  };

  const isInWishList = (product) => {
    const productId = product.product_id || product.id;
    const variantId = product.variantId || product.variant_id || null;
    return wishList.some(
      (item) =>
        (item.product_id || item.id) === productId &&
        (item.variant_id ?? null) === (variantId ?? null)
    );
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    const productId = product.product_id || product.id;
    const variantId = product.variantId || product.variant_id || null;
    const opKey = productId + (variantId || "");
    
    if (pendingCartIds.has(opKey)) return;

    setPendingCartIds((prev) => new Set([...prev, opKey]));
    try {
      if (isInCart(product)) {
        await deleteItem(product);
      } else {
        await addToCart({ ...product, variantId });
      }
    } finally {
      setPendingCartIds((prev) => {
        const next = new Set(prev);
        next.delete(opKey);
        return next;
      });
    }
  };

  const handleAddToWishList = (e, product) => {
    e.stopPropagation();
    if (isInWishList(product)) {
      removeFromWishList(product);
    } else {
      addToWishList(product);
    }
  };

  return (
    <div id="shop" className="w-full px-4 md:px-10 py-8 bg-gray-50">
      <div className="flex justify-between items-end mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Featured Products
        </h1>
        <p className="text-gray-500 text-sm hidden md:block">
          Handpicked items for you
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {limitedProducts.map((product) => {
          const inCart = isInCart(product);
          const inWish = isInWishList(product);
          const productId = product.product_id || product.id;
          const isPending = pendingCartIds.has(productId + (product.variantId || ""));

          return (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.slug}`)}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="relative aspect-square overflow-hidden bg-white p-6 flex items-center justify-center">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className={`max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110 ${
                    hoveredProduct === product.id ? "scale-110" : "scale-100"
                  }`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />

                {product.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow">
                    -{product.discountPercent}%
                  </span>
                )}

                {/* Action buttons — slide up on hover */}
                <div
                  className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 transition-all duration-300 ${
                    hoveredProduct === product.id
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  {/* Cart button */}
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={isPending}
                    title={inCart ? "Remove from cart" : "Add to cart"}
                    className={`p-2 rounded-full shadow-md transition-all duration-200 active:scale-90 ${
                      isPending
                        ? "bg-blue-400 text-white scale-110 animate-pulse"
                        : inCart
                        ? "bg-blue-600 text-white scale-110"
                        : "bg-white text-gray-800 hover:bg-blue-600 hover:text-white hover:scale-110"
                    }`}
                  >
                    {inCart && !isPending ? (
                      <CheckIcon fontSize="small" />
                    ) : (
                      <ShoppingCartOutlinedIcon fontSize="small" />
                    )}
                  </button>

                  {/* Wishlist button */}
                  <button
                    onClick={(e) => handleAddToWishList(e, product)}
                    title={inWish ? "Remove from wishlist" : "Add to wishlist"}
                    className={`p-2 rounded-full shadow-md transition-all duration-200 active:scale-90 ${
                      inWish
                        ? "bg-pink-600 text-white scale-110"
                        : "bg-white text-gray-800 hover:bg-pink-600 hover:text-white hover:scale-110"
                    }`}
                  >
                    {inWish ? (
                      <FavoriteIcon fontSize="small" />
                    ) : (
                      <FavoriteBorderSharpIcon fontSize="small" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h2 className="text-gray-900 font-medium line-clamp-1">
                  {product.name}
                </h2>

                <div className="flex items-center gap-2">
                  {product.discountPercent > 0 && (
                    <span className="text-gray-400 line-through text-sm">
                      ₹{product.price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-lg font-semibold text-gray-900">
                    ₹{product.discountPrice?.toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-yellow-600">
                  ⭐ {product.rating}{" "}
                  <span className="text-gray-400">({product.reviewsCount})</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedProducts;
