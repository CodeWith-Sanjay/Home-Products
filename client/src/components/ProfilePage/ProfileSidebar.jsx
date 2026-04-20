import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Settings,
} from "lucide-react";

const ProfileSidebar = ({ activeTab, setActiveTab }) => {
  const menu = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "cart", label: "Cart", icon: ShoppingCart },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 h-screen sticky top-0 bg-white/80 backdrop-blur-xl border-r border-gray-200 p-6 hidden md:flex flex-col">

      {/* HEADER */}
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        My Account
      </h2>

      {/* MENU */}
      <div className="space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              {/* ICON */}
              <Icon
                size={20}
                className={`transition ${
                  isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                }`}
              />

              {/* LABEL */}
              <span className="font-medium">{item.label}</span>

              {/* ACTIVE INDICATOR */}
              {isActive && (
                <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* FOOTER (OPTIONAL MODERN TOUCH) */}
      <div className="mt-auto text-xs text-gray-400">
        © 2026 Your Store
      </div>
    </div>
  );
};

export default ProfileSidebar;