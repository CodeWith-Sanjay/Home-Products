import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import HomeLogo from "../../assets/HomeLogo.png";

import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderSharpIcon from "@mui/icons-material/FavoriteBorderSharp";

import { CartContext } from "../../context/CartContext/CartContext";
import { WishListContext } from "../../context/WishListContext/WishListContext";

import { animation, navMainIcon } from "../../utils/UIStyles";

const menuCategories = [
  {
    name: "Rooms",
    items: ["Kitchen", "Living Room", "Bedroom", "Bathroom", "Office", "Dining Room"],
  },
  {
    name: "Collections",
    items: ["Lighting", "Decor", "Furniture", "Appliances"],
  }
];

const NavMain = ({ sidebarOpen, setSidebarOpen }) => {
  const { cart } = useContext(CartContext);
  const { wishList } = useContext(WishListContext);

  const auth = JSON.parse(localStorage.getItem("auth"));
  const seller = JSON.parse(localStorage.getItem("seller"));
  const currentUser = auth || seller;
  const isSeller = !!seller;

  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <div
      className={`w-full bg-white flex items-center justify-between px-10 z-50 md:px-0 md:justify-around py-2 ${animation}`}
    >
      <div className="flex">
        <div 
          onClick={() => navigate("/")}
          className="text-2xl text-gray-800 text-center font-semibold cursor-pointer"
        >
          <img className="w-56 h-20" src={HomeLogo} alt="Home products logo" />
        </div>

        <div
          className={`hidden relative md:flex items-center cursor-pointer px-4`}
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <div className={`text-gray-800 hover:text-blue-500 flex items-center gap-1 ${animation}`}>
            <span className="text-sm font-black uppercase tracking-widest">Categories</span>
            <KeyboardArrowDownOutlinedIcon fontSize="small" />
          </div>

          <div
            className={`absolute top-full left-0 pt-3 w-[450px] bg-white shadow-2xl rounded-2xl p-6 z-50 grid grid-cols-2 gap-8
            ${showDropdown ? "translate-y-0 opacity-100 visible" : "translate-y-5 opacity-0 invisible"} 
            ${animation}`}
          >
            {menuCategories.map((section) => (
              <div key={section.name} className="space-y-4">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-gray-100 pb-2">
                  {section.name}
                </h4>
                <div className="flex flex-col gap-2">
                  {section.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => navigate(`/category/${item.toLowerCase().replace(/\s+/g, '')}`)}
                      className="text-left text-sm font-bold text-gray-600 hover:text-blue-500 hover:translate-x-2 transition-all duration-300"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden md:flex gap-0">
        <input
          className={`w-full lg:min-w-sm outline-0 text-gray-800 border bg-white border-gray-200 hover:border-gray-600 py-3 pr-10 px-4 rounded-full ${animation}`}
          type="text"
          placeholder="Search products..."
        />
      </div>

      <div className="hidden md:flex gap-9 text-gray-800">
        <div
          className={`hidden relative md:flex items-center cursor-pointer`}
          onMouseEnter={() => setShowProfileDropdown(true)}
          onMouseLeave={() => setShowProfileDropdown(false)}
        >
          <div>
            {auth?.profile_picture_url ? (
              <img
                src={auth.profile_picture_url}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition-all shadow-sm"
              />
            ) : (
              <span
                className={`relative hover:bg-blue-900 ${navMainIcon} ${animation}`}
              >
                <PermIdentityIcon />
              </span>
            )}
          </div>

          <div
            className={`absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-50
  ${showProfileDropdown ? "translate-y-0 opacity-100 visible" : "translate-y-10 opacity-0 invisible"} 
  ${animation}`}
          >
            {currentUser ? (
              <>
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-tight">
                    {isSeller ? "Seller Account" : "Customer Account"}
                  </p>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {currentUser.name || currentUser.business_name}
                  </p>
                </div>

                {!isSeller && (
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    My Profile
                  </button>
                )}

                {!auth && (
                  <button
                    onClick={() => navigate("/seller")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Seller Portal
                  </button>
                )}

                <button
                  onClick={() => {
                    localStorage.removeItem("auth");
                    localStorage.removeItem("seller");
                    navigate("/");
                    window.location.reload();
                  }}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 font-bold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/customer-login")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition font-bold text-gray-800"
                >
                  Customer Login
                </button>

                <div className="border-t border-gray-50 my-1"></div>

                <button
                  onClick={() => navigate("/seller/login")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition text-blue-600 font-bold"
                >
                  Seller Login
                </button>
              </>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => navigate("/cart")}
            className={`hover:bg-blue-600 ${navMainIcon} ${animation}`}
          >
            <ShoppingCartOutlinedIcon />
          </button>
          {cart?.length > 0 && (
            <p className="px-1 text-sm absolute -top-1 -right-2 bg-blue-500 text-white rounded-full">
              {cart?.length || 0}
            </p>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => navigate("/wishlist")}
            className={`hover:bg-pink-500 ${navMainIcon} ${animation}`}
          >
            <FavoriteBorderSharpIcon />
          </button>
          {wishList?.length > 0 && (
            <p className="px-1 text-sm absolute -top-1 -right-2 bg-pink-500 text-white rounded-full">
              {wishList?.length || 0}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`flex flex-col gap-1.5 md:hidden cursor-pointer`}
      >
        <span
          className={`block w-7 h-0.5 bg-gray-800 ${animation} ${sidebarOpen ? "rotate-45 translate-y-2 bg-red-500" : ""}`}
        ></span>
        <span
          className={`w-7 h-0.5 bg-gray-800 ${animation} ${sidebarOpen ? "opacity-0" : "opacity-100"}`}
        ></span>
        <span
          className={`w-7 h-0.5 bg-gray-800 ${animation} ${sidebarOpen ? "-rotate-45 -translate-y-2 bg-red-500" : ""}`}
        ></span>
      </button>
    </div>
  );
};

export default NavMain;
