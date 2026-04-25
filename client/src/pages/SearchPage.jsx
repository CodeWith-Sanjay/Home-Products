import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderSharpIcon from '@mui/icons-material/FavoriteBorderSharp';
import SearchIcon from "@mui/icons-material/Search";
import { CartContext } from '../context/CartContext/CartContext';
import { WishListContext } from '../context/WishListContext/WishListContext';
import { api } from '../services/api';

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  
  const { cart, addToCart, deleteItem } = useContext(CartContext);
  const { wishList, addToWishList, removeFromWishList } = useContext(WishListContext);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await api.get(`/product/search?q=${encodeURIComponent(query)}`);
        if (res.data.success) {
          setResults(res.data.data);
        }
      } catch (error) {
        console.error("Search fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
    window.scrollTo(0, 0);
  }, [query]);

  const handleAddToCart = (product) => {
    const productId = product.product_id || product.id;
    const variantId = product.variant_id || null;
    
    const exist = cart.find(item => item.product_id === productId && (item.variant_id ?? null) === (variantId ?? null));
    if (exist) {
      deleteItem(product);
    } else {
      addToCart(product);
    }
  };

  const handleAddToWishList = (product) => {
    const productId = product.product_id || product.id;
    const variantId = product.variant_id || null;

    const exist = wishList.find(item => (item.product_id || item.id) === productId && (item.variant_id ?? null) === (variantId ?? null));
    exist ? removeFromWishList(product) : addToWishList(product);
  };

  return (
    <div>
      <Navbar />
      <div className='pt-28 md:pt-40 min-h-screen bg-gray-50 flex flex-col'>
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-12 py-10">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 mb-2 animate-in slide-in-from-left duration-500">
              Search Results
            </h1>
            <div className="flex items-center gap-2 text-gray-500 animate-in slide-in-from-left duration-700">
              Showing results for <span className="text-blue-600 font-black italic">"{query}"</span> 
              <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
              <span className="font-bold text-gray-700">{results.length} items found</span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Searching Catalog...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {results.map((product, idx) => (
                <div
                  key={product.product_id}
                  onClick={() => navigate(`/product/${product.slug}`)}
                  onMouseEnter={() => setHoveredProduct(product.product_id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className="group relative bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer animate-in zoom-in-95 duration-500"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="relative h-72 overflow-hidden bg-gray-50">
                    <img
                      src={product.pi_images?.[0]?.image_url || 'https://via.placeholder.com/300'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                    
                    <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 transition-all duration-500 ${hoveredProduct === product.product_id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        className={`p-4 rounded-2xl shadow-xl transition-all active:scale-90 ${cart.some(item => item.product_id === product.product_id) ? "bg-blue-600 text-white" : "bg-white text-gray-800 hover:bg-blue-600 hover:text-white"}`}
                      >
                        <ShoppingCartOutlinedIcon fontSize="small" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToWishList(product); }}
                        className={`p-4 rounded-2xl shadow-xl transition-all active:scale-90 ${wishList.some(item => (item.product_id || item.id) === product.product_id) ? "bg-pink-600 text-white" : "bg-white text-gray-800 hover:bg-pink-600 hover:text-white"}`}
                      >
                        <FavoriteBorderSharpIcon fontSize="small" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{product.brand || 'Premium Home'}</p>
                            <h2 className="text-gray-900 font-bold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
                                {product.name}
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-gray-900 tracking-tighter">₹{Number(product.price).toLocaleString()}</span>
                      {product.mrp > product.price && (
                        <span className="text-sm text-gray-400 line-through font-bold opacity-60">₹{Number(product.mrp).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 animate-in zoom-in-95 duration-500">
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                 <SearchIcon className="text-gray-300 scale-[2]" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-3">No Results Found</h3>
              <p className="text-gray-500 max-w-md mx-auto font-medium">
                We couldn't find any products matching <span className="text-blue-600 font-bold italic">"{query}"</span>. 
                Try checking your spelling or using more general terms.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="mt-10 px-12 py-5 bg-gray-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-xl"
              >
                Explore Collections
              </button>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default SearchPage;
