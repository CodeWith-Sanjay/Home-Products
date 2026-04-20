import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CartContext } from "../../context/CartContext/CartContext";
import { WishListContext } from "../../context/WishListContext/WishListContext";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, deleteItem } = useContext(CartContext);
  const {addToWishList} = useContext(WishListContext);

  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Pre-select all items when cart loads
  useEffect(() => {
    if (cart.length > 0 && selectedItems.length === 0) {
      setSelectedItems(cart.filter(item => item.stock > 0).map(item => item.cart_item_id));
    }
  }, [cart]);

  const toggleSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const selectedCartItems = cart.filter(item => selectedItems.includes(item.cart_item_id));

  const hasOutOfStock = cart.some((item) => item.stock === 0);

  const subtotal = selectedCartItems.reduce((acc, item) => {
    if (item.stock === 0) return acc;
    return acc + item.discountPrice * (item.quantity || 1);
  }, 0);

  const totalItems = selectedCartItems.reduce(
    (acc, item) => acc + (item.quantity || 1),
    0
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <p className="text-2xl font-semibold text-gray-400">
          Your cart is empty 🛒
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2 rounded-xl bg-black text-white"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const increaseQty = (product) => {
    if (product.quantity >= product.stock) return;
    addToCart(product);
  };

  const decreaseQty = (product) => {
    removeFromCart(product);
  };

  const handleCheckout = () => {
    if (selectedCartItems.length === 0) {
      alert("Please select at least one item to checkout");
      return;
    }
    navigate("/checkout", { state: { checkoutItems: selectedCartItems } });
  };

  return (
    <div className="w-full px-6 md:px-12 py-10  min-h-screen bg-gray-50/50">

      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your items and proceed to checkout
          </p>
        </div>
        <p className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
          {selectedCartItems.length} of {cart.length} items selected
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        <div className="lg:col-span-2 space-y-6">

          {cart.map((product) => (
            <div
              key={product.cart_item_id}
              className={`bg-white rounded-3xl p-5 flex gap-6 border transition-all duration-300
                ${selectedItems.includes(product.cart_item_id) ? "border-blue-200 shadow-md ring-1 ring-blue-50" : "border-gray-100 shadow-sm opacity-80"}
                ${product.stock === 0 ? "grayscale opacity-60" : ""}
              `}
            >
              {/* CHECKBOX */}
              <div className="flex items-center">
                <input 
                  type="checkbox"
                  disabled={product.stock === 0}
                  checked={selectedItems.includes(product.cart_item_id)}
                  onChange={() => toggleSelection(product.cart_item_id)}
                  className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>

              <div className="relative group">
                <img
                  src={product.thumbnail || product.images?.[0] || "https://via.placeholder.com/400"}
                  alt={product.name}
                  onClick={() => navigate(`/product/${product.slug}`)}
                  className={`w-32 h-32 object-cover rounded-2xl transition duration-500
                    ${product.stock === 0 ? "" : "cursor-pointer group-hover:scale-105 group-hover:shadow-lg"}
                  `}
                />
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Out of Stock</span>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between py-1">

                <div>
                  <h2 
                    onClick={() => navigate(`/product/${product.slug}`)}
                    className={`text-lg font-bold text-gray-900 hover:text-blue-600 transition cursor-pointer inline-block
                      ${product.stock === 0 ? "pointer-events-none" : ""}
                    `}
                  >
                    {product.name}
                  </h2>

                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-blue-600 font-bold text-lg">
                      ₹{product.discountPrice}
                    </p>
                    {product.mrp > product.discountPrice && (
                      <p className="text-sm text-gray-400 line-through">
                        ₹{product.mrp}
                      </p>
                    )}
                  </div>

                  {product.stock > 0 && product.stock <= 3 && (
                    <span className="text-xs font-semibold text-orange-500 mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                      Only {product.stock} units left!
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">

                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-1">
                    <button
                      onClick={() => decreaseQty(product)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-white rounded-xl transition"
                    >
                      −
                    </button>

                    <span className="px-4 text-sm font-bold text-gray-800">
                      {product.quantity || 1}
                    </span>

                    <button
                      onClick={() => increaseQty(product)}
                      disabled={product.stock === 0 || product.quantity >= product.stock}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl transition
                        ${product.stock === 0 || product.quantity >= product.stock
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:text-blue-600 hover:bg-white"
                        }`}
                    >
                      +
                    </button>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => addToWishList(product)}
                      className="text-xs font-medium text-gray-400 hover:text-blue-600 transition"
                    >
                      Move to Wishlist
                    </button>
                    <button
                      onClick={() => deleteItem(product)}
                      className="text-xs font-medium text-red-400 hover:text-red-600 transition"
                    >
                      Remove
                    </button>
                  </div>

                </div>

              </div>

              <div className="text-right flex flex-col justify-start pt-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Total</p>
                <p className="text-xl font-black text-gray-900">
                  ₹{product.discountPrice * (product.quantity || 1)}
                </p>
              </div>

            </div>
          ))}

        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 h-fit sticky top-10 space-y-8">

          <h2 className="text-2xl font-bold text-gray-900">
            Order Summary
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Selected Items</span>
              <span className="text-gray-900">{totalItems}</span>
            </div>

            <div className="flex justify-between text-gray-500 font-medium">
              <span>Subtotal</span>
              <span className="text-gray-900">₹{subtotal}</span>
            </div>

            <div className="flex justify-between text-gray-500 font-medium">
              <span>Delivery</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            
            <div className="pt-4 border-t border-dashed border-gray-200">
              <div className="flex justify-between items-end">
                <span className="text-gray-900 font-bold">Total Amount</span>
                <span className="text-3xl font-black text-blue-600">₹{subtotal}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-right">Inclusive of all taxes and fees</p>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={selectedCartItems.length === 0}
            className={`w-full py-4 rounded-[1.25rem] font-bold text-lg shadow-lg transition-all duration-300
              ${selectedCartItems.length === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 active:scale-95 shadow-blue-200"
              }`}
          >
            Checkout {selectedCartItems.length > 0 ? `(₹${subtotal})` : ""}
          </button>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Secure", icon: "🔒" },
              { label: "Fast", icon: "🚚" },
              { label: "Easy", icon: "↩" }
            ].map(badge => (
              <div key={badge.label} className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center gap-1">
                <span className="text-lg">{badge.icon}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{badge.label}</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;