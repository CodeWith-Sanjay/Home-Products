import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import MoreProducts from '../components/FeaturedProducts/MoreProducts';
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderSharpIcon from '@mui/icons-material/FavoriteBorderSharp';
import { CartContext } from '../context/CartContext/CartContext';
import { WishListContext } from '../context/WishListContext/WishListContext';
import { ProductContext } from '../context/ProductContext/ProductContext';

const CategoryProducts = ({ roomName }) => {
  const navigate = useNavigate();
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const { cart, addToCart, removeFromCart, deleteItem } = useContext(CartContext);
  const { products } = useContext(ProductContext);
  const { wishList, addToWishList, removeFromWishList } = useContext(WishListContext);

  const filteredProducts = products.filter(
    (product) => product.room?.toLowerCase().replace(/\s+/g, '') === roomName.toLowerCase().replace(/\s+/g, '')
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [roomName]);

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
      <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 capitalize">
        {roomName} Collection
      </h1>
      <p className="text-gray-500 mb-10">Premium products curated for your {roomName.toLowerCase()}</p>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.slug}`)}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition cursor-pointer"
            >
              <div className="relative h-72 overflow-hidden bg-gray-50">
                <img
                  src={product.thumbnail || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                
                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 transition duration-300 ${hoveredProduct === product.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                    className={`p-3 rounded-full shadow-lg transition-all ${cart.some((item) => 
                      item.product_id === (product.product_id || product.id) && 
                      (item.variant_id ?? null) === ((product.variantId || product.variant_id) ?? null)
                    ) ? "bg-blue-600 text-white" : "bg-white text-gray-800 hover:bg-blue-600 hover:text-white"}`}
                  >
                    <ShoppingCartOutlinedIcon fontSize="small" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddToWishList(product); }}
                    className={`p-3 rounded-full shadow-lg transition-all ${wishList.some((item) => 
                      (item.product_id || item.id) === (product.product_id || product.id) &&
                      (item.variant_id ?? null) === ((product.variantId || product.variant_id) ?? null)
                    ) ? "bg-pink-600 text-white" : "bg-white text-gray-800 hover:bg-pink-600 hover:text-white"}`}
                  >
                    <FavoriteBorderSharpIcon fontSize="small" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h2 className="text-gray-900 font-bold line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-gray-900">₹{product.discountPrice?.toLocaleString()}</span>
                  {product.price > product.discountPrice && (
                    <span className="text-xs text-gray-400 line-through">₹{product.price?.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-medium">No products found for this room yet.</p>
        </div>
      )}
    </div>
  );
};

const CategoryProductsPage = () => {
  const { room } = useParams();
  
  // Clean up room name (e.g. "livingroom" -> "Living Room")
  const formatRoom = (r) => {
    if (r === 'livingroom') return 'Living Room';
    if (r === 'bedroom') return 'Bedroom';
    if (r === 'diningroom') return 'Dining Room';
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  return (
    <div>
      <Navbar />
      <div className='mt-5 md:mt-0 pt-28 md:pt-40'>
        <CategoryProducts roomName={formatRoom(room)} />
        <MoreProducts />
        <Footer />
      </div>
    </div>
  );
};

export default CategoryProductsPage;
