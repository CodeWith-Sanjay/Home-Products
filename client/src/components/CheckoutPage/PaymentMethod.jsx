import { card, buttonPrimary, buttonSecondary } from "../../utils/UIStyles";

const PaymentMethod = ({ paymentMethod, setPaymentMethod, onBack, onNext }) => {
  return (
    <div className={`${card} p-6 space-y-6`}>

      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Payment Method
        </h2>
        <p className="text-sm text-gray-500">
          Choose how you want to pay
        </p>
      </div>

      <div className="space-y-4">

        <div
          onClick={() => setPaymentMethod("razorpay")}
          className={`p-5 rounded-xl border cursor-pointer transition
          ${paymentMethod === "razorpay"
              ? "border-blue-500 bg-blue-50"
              : "hover:border-blue-300"
          }`}
        >
          <p className="font-medium">Online Payment</p>
          <p className="text-sm text-gray-500">
            UPI, Cards, Net Banking
          </p>
        </div>

        <div
          onClick={() => setPaymentMethod("cod")}
          className={`p-5 rounded-xl border cursor-pointer transition
          ${paymentMethod === "cod"
              ? "border-green-500 bg-green-50"
              : "hover:border-green-300"
          }`}
        >
          <p className="font-medium">Cash on Delivery</p>
          <p className="text-sm text-red-500">₹50 extra fee</p>
        </div>

      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className={buttonSecondary}>
          ← Back
        </button>

        <button onClick={onNext} className={buttonPrimary}>
          Continue →
        </button>
      </div>

    </div>
  );
};

export default PaymentMethod;