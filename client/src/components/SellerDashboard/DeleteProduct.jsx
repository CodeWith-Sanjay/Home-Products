import React, { useContext, useState } from "react";
import { ProductContext } from "../../context/ProductContext/ProductContext";

const DeleteProduct = ({ product, onClose }) => {
  const { deleteProduct } = useContext(ProductContext);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteProduct(product.product_id || product.id);
      if (res.success) {
        onClose();
      } else {
        alert(res.error || "Failed to delete product");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-md rounded-3xl shadow-xl p-6 text-center animate-modal">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        
        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
          Delete Product?
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          This action cannot be undone. You are about to delete{" "}
          <span className="font-bold text-gray-900 underline decoration-red-200">
            {product?.name}
          </span>
        </p>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-400 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button 
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProduct;