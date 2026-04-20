import React, { useState, useContext, useEffect } from "react";
import { ProductContext } from "../../context/ProductContext/ProductContext";
import * as productService from "../../services/productService";

const EditProduct = ({ product, onClose }) => {
  const { updateProduct } = useContext(ProductContext);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.discountPrice || product?.price || "",
    mrp: product?.mrp || product?.basePrice || "",
    stock_quantity: product?.stock || "",
    brand: product?.brand || "",
    category_id: product?.category_id || "",
    room: product?.room || "",
  });

  useEffect(() => {
    const fetchCats = async () => {
      const res = await productService.getCategories();
      if (res.success) setCategories(res.data);
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProduct(product.product_id || product.id, form);
      if (res.success) {
        onClose();
      } else {
        alert(res.error || "Update failed");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[95%] max-w-2xl rounded-3xl shadow-2xl p-8 animate-modal overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              Edit Product
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              Update details for: {product.name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <span className="text-2xl">✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-1">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Product Name</label>
                <input name="name" value={form.name} onChange={handleChange} className={inputClass} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Brand</label>
                <input name="brand" value={form.brand} onChange={handleChange} className={inputClass} />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows="3" className={inputClass} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-1">Pricing & Stock</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Sale Price (₹)</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} className={inputClass} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">MRP (₹)</label>
                <input name="mrp" type="number" value={form.mrp} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Stock Qty</label>
                <input name="stock_quantity" type="number" value={form.stock_quantity} onChange={handleChange} className={inputClass} required />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-1">Categorization</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Category</label>
                <select name="category_id" value={form.category_id} onChange={handleChange} className={inputClass} required>
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Room</label>
                <select name="room" value={form.room} onChange={handleChange} className={inputClass}>
                  <option value="">Select Room</option>
                  <option value="Living Room">Living Room</option>
                  <option value="Bedroom">Bedroom</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Dining Room">Dining Room</option>
                  <option value="Office">Office</option>
                  <option value="Bathroom">Bathroom</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50 flex gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              className="flex-1 py-4 rounded-2xl border border-gray-200 text-sm font-bold text-gray-400 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:translate-y-0 text-sm uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;