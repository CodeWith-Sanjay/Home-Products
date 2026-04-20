import React, { useRef, useState, useEffect } from "react";

import NavMain from "./NavMain";
import NavOptions from "./NavOptions";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);

  const lastScrollTop = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;

      if (Math.abs(currentScroll - lastScrollTop.current) < 10) return;

      if (currentScroll > lastScrollTop.current && currentScroll > 80) {
        setShowNavbar(false);
      } 
      else {
        setShowNavbar(true);
      }

      lastScrollTop.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out
        ${showNavbar ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm">

        <NavMain
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <NavOptions />
      </div>

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
    </div>
  );
};

export default Navbar;