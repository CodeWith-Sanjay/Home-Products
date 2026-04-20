import { card } from "../../utils/UIStyles";

const OrderSummary = ({
  subtotal = 0,
  delivery = 0,
  gst = 0,
  platformFee=10,
  total = 0,
  paymentMethod = "razorpay",
}) => {
  const codFee = paymentMethod === "cod" ? 50 : 0;

  return (
    <div className={`${card} p-6 space-y-6 sticky top-10`}>

      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-gray-900">
          Order Summary
        </h2>
        <p className="text-sm text-gray-500">
          Review your order before checkout
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">

        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium text-gray-900">
            ₹{subtotal}
          </span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Delivery</span>
          <span className={delivery === 0 ? "text-green-600 font-medium" : "text-gray-900"}>
            {delivery === 0 ? "Free" : `₹${delivery}`}
          </span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Platform</span>
          <span className={platformFee === 0 ? "text-green-600 font-medium" : "text-gray-900"}>
            {platformFee === 0 ? "Free" : `₹${platformFee}`}
          </span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>GST (5%)</span>
          <span className="text-gray-900">
            ₹{gst}
          </span>
        </div>

        {paymentMethod === "cod" && (
          <div className="flex justify-between text-sm text-red-500">
            <span>COD Fee</span>
            <span>₹{codFee}</span>
          </div>
        )}

      </div>

      <div className="rounded-xl p-4 flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100">

        <div>
          <p className="text-sm text-gray-600">
            Total Payable
          </p>
          <p className="text-xs text-gray-400">
            Inclusive of all taxes
          </p>
        </div>

        <span className="text-2xl font-bold text-blue-700 tracking-tight">
          ₹{total}
        </span>

      </div>

      <div className="flex justify-between items-center text-sm border rounded-xl px-4 py-3">

        <span className="text-gray-500">
          Payment Method
        </span>

        <span className={`font-medium ${
          paymentMethod === "cod"
            ? "text-orange-600"
            : "text-gray-800"
        }`}>
          {paymentMethod === "cod"
            ? "Cash on Delivery"
            : "Online Payment"}
        </span>

      </div>

      <div className="flex justify-between text-xs text-gray-400 pt-1">
        <span>🔒 Secure</span>
        <span>🚚 Fast Delivery</span>
        <span>↩ Easy Returns</span>
      </div>

    </div>
  );
};

export default OrderSummary;