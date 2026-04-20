import { Heart } from "lucide-react";
import { useContext } from "react";
import Card from "./Card";
import { WishListContext } from "../../context/WishListContext/WishListContext";

const ProfileWishlist = () => {
  const { wishList } = useContext(WishListContext);

  if (wishList.length === 0) {
    return (
      <Card title="Wishlist">
        <p className="text-gray-500 text-center py-6 italic">Your wishlist is empty</p>
      </Card>
    );
  }

  return (
    <Card title="Wishlist">
      <div className="space-y-4">

        {wishList.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-200"
          >
            {/* LEFT */}
            <div className="flex items-center gap-4">
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
                  Saved for later
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

export default ProfileWishlist;