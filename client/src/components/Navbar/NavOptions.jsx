import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { scrollToSection } from "../../utils/scrollToSection";

const menuItems = [
  { name: "Home", id: "home" },
  { name: "Shop", id: "shop" },
  { name: "About", id: "about" },
  { name: "Blog", id: "blog" },
  { name: "Contact", id: "contact" },
];

const NavOptions = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("home");

  return (
    <div className="hidden md:flex justify-center py-3 bg-white/70 backdrop-blur-md border-b border-gray-100">

      <ul className="flex items-center gap-3 bg-gray-100/60 p-1 rounded-full">

        {menuItems.map((item) => {
          const isActive = active === item.id;

          return (
            <li
              key={item.name}
              onClick={() => {
                setActive(item.id);
                scrollToSection(item.id, navigate);
              }}
              className={`
                px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200
                ${isActive 
                  ? "bg-white shadow text-blue-600" 
                  : "text-gray-600 hover:text-blue-600 hover:bg-white/60"
                }
              `}
            >
              {item.name}
            </li>
          );
        })}

      </ul>
    </div>
  );
};

export default NavOptions;