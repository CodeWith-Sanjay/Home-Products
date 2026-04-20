import { useContext } from "react";
import Card from "./Card";
import { CartContext } from "../../context/CartContext/CartContext";

const ProfileCart = () => {
  const { cart } = useContext(CartContext);

  if (cart.length === 0) {
    return (
      <Card title="Cart">
        <p className="text-gray-500 text-center py-6 italic">Your cart is empty</p>
      </Card>
    );
  }

  return (
    <Card title="Cart">
      <div className="space-y-4">

        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
          >
            {/* LEFT */}
            <div className="flex items-center gap-4">
              {/* Fake image box (modern UI always has visual) */}
              <img
                src={item.thumbnail || "https://via.placeholder.com/400"}
                alt={item.name}
                className="w-14 h-14 rounded-xl object-cover"
              />

              <div>
                <p className="font-semibold text-gray-800">
                  {item.name}
                </p>
                <p className="text-sm text-gray-400">
                  Ready to checkout
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="text-right">
              <p className="font-bold text-gray-900">
                ₹{item.discountPrice || item.price}
              </p>
            </div>
          </div>
        ))}

      </div>
    </Card>
  );
};

export default ProfileCart;