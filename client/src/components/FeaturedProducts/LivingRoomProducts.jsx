import React, {useState, useEffect, useContext} from 'react'
import { useNavigate } from 'react-router-dom';

import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderSharpIcon from '@mui/icons-material/FavoriteBorderSharp';
import { CartContext } from '../../context/CartContext/CartContext';
import { WishListContext } from '../../context/WishListContext/WishListContext';
import { ProductContext } from '../../context/ProductContext/ProductContext';

const LivingRoomProducts = () => {
  const navigate = useNavigate();
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const { cart, addToCart, removeFromCart, deleteItem } = useContext(CartContext);
  const { wishList, addToWishList, removeFromWishList } =
    useContext(WishListContext);
  const {products} = useContext(ProductContext);

  const livingroomProducts = (products || []).filter(
    (product) => product.room === "Living Room"
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCart = (product) => {
    const productId = product.product_id || product.id;
    const variantId = product.variantId || product.variant_id || null;
    
    const exist = cart.find(
      (item) =>
        item.product_id === productId &&
        (item.variant_id ?? null) === (variantId ?? null)
    );
    
    if (exist) {
      deleteItem(product);
    } else {
      addToCart(product);
    }
  };

  const handleAddToWishList = (product) => {
    const productId = product.product_id || product.id;
    const variantId = product.variantId || product.variant_id || null;

    const exist = wishList.find(
      (item) =>
        (item.product_id || item.id) === productId &&
        (item.variant_id ?? null) === (variantId ?? null)
    );
    exist ? removeFromWishList(product) : addToWishList(product);
  };

  return (
    <div className="w-full px-4 md:px-12 py-16 bg-gray-50">

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
        Living Room Products
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {livingroomProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.slug}`)}
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
            className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition cursor-pointer"
          >

            <div className="relative h-72 overflow-hidden bg-gray-50">

              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
              
              {product.discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg z-10">
                  -{product.discountPercent}%
                </span>
              )}

              <div
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 transition duration-300
                ${
                  hoveredProduct === product.id
                    ? "opacity-100"
                    : "opacity-0 md:group-hover:opacity-100 opacity-100"
                }`}
              >

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  className={`p-2 rounded-full shadow-md transition
                    ${
                      cart.some((item) => 
                        item.product_id === (product.product_id || product.id) && 
                        (item.variant_id ?? null) === ((product.variantId || product.variant_id) ?? null)
                      )
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-800 hover:bg-blue-600 hover:text-white"
                    }`}
                >
                  <ShoppingCartOutlinedIcon fontSize="small" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWishList(product);
                  }}
                  className={`p-2 rounded-full shadow-md transition
                    ${
                      wishList.some((item) => 
                        (item.product_id || item.id) === (product.product_id || product.id) &&
                        (item.variant_id ?? null) === ((product.variantId || product.variant_id) ?? null)
                      )
                        ? "bg-pink-600 text-white"
                        : "bg-white text-gray-800 hover:bg-pink-600 hover:text-white"
                    }`}
                >
                  <FavoriteBorderSharpIcon fontSize="small" />
                </button>

              </div>
            </div>

            <div className="p-4 space-y-2">

              <h2 className="text-gray-900 font-medium line-clamp-1">
                {product.name}
              </h2>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 line-through text-sm">
                  ₹{product.price?.toLocaleString()}
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  ₹{product.discountPrice?.toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-yellow-600">
                ⭐ {product.rating || "0.0"}{" "}
                <span className="text-gray-400">({product.reviewsCount || 0})</span>
              </p>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default LivingRoomProducts
