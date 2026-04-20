import React, { useState, useContext } from "react";
import { ProductContext } from "../../context/ProductContext/ProductContext";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import DeleteProduct from "./DeleteProduct";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const SellerProducts = () => {
  const { products } = useContext(ProductContext);
  const auth = JSON.parse(localStorage.getItem("seller"));
  const sellerId = auth?.seller_id || auth?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priceSort, setPriceSort] = useState("none");

  // Filter products added by this seller
  let sellerProducts = products.filter(p => p.seller_id === sellerId);

  // Search filter
  if (searchQuery) {
    sellerProducts = sellerProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toString().includes(searchQuery)
    );
  }

  // Status filter
  if (statusFilter !== "All") {
    sellerProducts = sellerProducts.filter(p => p.status === statusFilter);
  }

  // Price sort
  if (priceSort === "low") {
    sellerProducts.sort((a, b) => a.price - b.price);
  } else if (priceSort === "high") {
    sellerProducts.sort((a, b) => b.price - a.price);
  }

  const [showAdd, setShowAdd] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const statusStyle = (status) =>
    status === "Active"
      ? "bg-green-50 text-green-600 ring-1 ring-green-100"
      : "bg-gray-50 text-gray-500 ring-1 ring-gray-100";

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Products ({sellerProducts.length})
        </h2>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <SearchIcon className="absolute left-3 top-2.5 text-gray-400 text-sm" />
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowAdd(true)}
            className="whitespace-nowrap text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-medium shadow-sm shadow-blue-200"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FilterListIcon fontSize="small" />
          <span>Filters:</span>
        </div>

        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select 
          value={priceSort}
          onChange={(e) => setPriceSort(e.target.value)}
          className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="none">Sort by Price</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>

        {(searchQuery || statusFilter !== "All" || priceSort !== "none") && (
          <button 
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
              setPriceSort("none");
            }}
            className="text-sm text-red-500 font-medium hover:underline ml-auto"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Product</th>
                <th className="px-6 py-4 text-left font-semibold">Price</th>
                <th className="px-6 py-4 text-left font-semibold">Stock</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {sellerProducts.length > 0 ? sellerProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition">

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.thumbnail}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          SKU-{product.id.toString().slice(-6)}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-bold text-gray-800">
                    ₹{Number(product.price).toLocaleString()}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`font-medium ${product.stock < 10 ? 'text-red-500' : 'text-gray-600'}`}>
                      {product.stock} units
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${statusStyle(product.status)}`}>
                      {product.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right space-x-3">

                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowEdit(true);
                      }}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowDelete(true);
                      }}
                      className="text-sm font-semibold text-red-500 hover:text-red-700 transition"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm">Try adjusting your filters or search query</p>
                  </td>
                </tr>
              )}

            </tbody>

          </table>
        </div>
      </div>

      {showAdd && <AddProduct onClose={() => setShowAdd(false)} />}
      {showEdit && <EditProduct product={selectedProduct} onClose={() => setShowEdit(false)} />}
      {showDelete && <DeleteProduct product={selectedProduct} onClose={() => setShowDelete(false)} />}

    </div>
  );
};

export default SellerProducts;