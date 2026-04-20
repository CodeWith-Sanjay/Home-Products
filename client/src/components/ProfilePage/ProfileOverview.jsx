import { useState, useEffect } from "react";
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
} from "lucide-react";

import Card from "./Card";
import { getCustomerStats, getCustomerOrders } from "../../services/authService";
import { WishListContext } from "../../context/WishListContext/WishListContext";
import { useContext } from "react";

const ProfileOverview = ({ user, setActiveTab }) => {
  const { wishList } = useContext(WishListContext);
  const [statsData, setStatsData] = useState({ orders: 0, cart: 0, wishlist: 0 });
  const [recentOrder, setRecentOrder] = useState(null);

  useEffect(() => {
    if (user?.customer_id) {
      getCustomerStats(user.customer_id).then((res) => {
        if (res.success) setStatsData(res.data);
      });
      getCustomerOrders(user.customer_id).then((res) => {
        if (res.success && res.data.length > 0) {
          setRecentOrder(res.data[0]);
        }
      });
    }
  }, [user]);

  if (!user) return null;

  const stats = [
    {
      label: "Orders",
      value: statsData.orders,
      key: "orders",
      icon: ShoppingBag,
      color: "from-blue-600 to-blue-400",
    },
    {
      label: "Cart",
      value: statsData.cart,
      key: "cart",
      icon: ShoppingCart,
      color: "from-blue-600 to-blue-400",
    },
    {
      label: "Wishlist",
      value: statsData.wishlist,
      key: "wishlist",
      icon: Heart,
      color: "from-blue-600 to-blue-400",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-6">
          {user.profile_picture_url ? (
            <img
              src={user.profile_picture_url}
              alt={user.full_name}
              className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-white"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {user.full_name?.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome back, {user.full_name}
            </h2>
            <div className="flex flex-wrap gap-4 mt-2">
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {user.email}
              </p>
              {user.phone && (
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  {user.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className="cursor-pointer group rounded-2xl p-6 bg-gray-50 border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg shadow-blue-100`}
                >
                  <Icon size={24} />
                </div>

                <p className="text-3xl font-extrabold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {item.value}
                </p>
              </div>

              <p className="text-gray-600 font-semibold">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Recent Activity">
          <div className="py-4">
            {recentOrder ? (
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-gray-800">Order #{recentOrder.order_id.slice(0,8)}</p>
                  <p className="text-gray-400">{new Date(recentOrder.placed_at).toLocaleDateString()}</p>
                </div>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase">
                  {recentOrder.order_status}
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No recent orders yet. Start shopping to see activity here.
              </p>
            )}
          </div>
        </Card>

        <Card title="Saved Items">
          <div className="py-4">
            {wishList.length > 0 ? (
              <div className="flex items-center gap-3">
                <img src={wishList[0].thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">{wishList[0].name}</p>
                  <p className="text-xs text-gray-400">₹{wishList[0].discountPrice}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Items you save will appear here for quick access.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfileOverview;