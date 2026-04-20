import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SellerAuthLayout from "./SellerAuthLayout";
import { sellerRegister, sendSellerOtp, verifySellerOtp } from "../../services/authService";

const SellerRegistration = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (localStorage.getItem("auth")) {
      setError("A customer is already logged in. Please logout first.");
      return;
    }

    if (!form.fullName || !form.email || !form.phone || !form.password) {
      setError("All required fields must be filled");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await sendSellerOtp({ email: form.email, purpose: "registration" });
      if (res.success) {
        setStep(2);
      } else {
        setError(res.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      // 1. Verify OTP
      const vRes = await verifySellerOtp({ email: form.email, otp, purpose: "registration" });
      if (!vRes.success) {
        setError(vRes.message || "Invalid OTP");
        setVerifying(false);
        return;
      }

      // 2. Register Seller
      const res = await sellerRegister({
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        store_name: 'temp'
      });

      if (!res.success) {
        setError(res.message);
        setVerifying(false);
        return;
      }

      localStorage.setItem("seller", JSON.stringify(res.data));
      navigate("/seller/onboarding");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setVerifying(false);
    }
  };

    
  return (
    <SellerAuthLayout>
      <div className="w-full">

        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Create Seller Account
        </h2>

        <form onSubmit={step === 1 ? handleSendOtp : handleVerifyAndRegister} className="space-y-4">
          {step === 1 ? (
            <>
              <input
                name="fullName"
                placeholder="Full Name"
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-gray-50 border"
              />

              <input
                name="email"
                placeholder="Business Email"
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-gray-50 border"
              />

              <input
                name="phone"
                placeholder="phone Number"
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-gray-50 border"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-gray-50 border"
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-gray-50 border"
              />
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Enter the 6-digit code sent to <span className="font-semibold">{form.email}</span>
              </p>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 border text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-center text-gray-400">
                Didn't receive the code? <span className="text-blue-600 cursor-pointer hover:underline" onClick={handleSendOtp}>Resend</span>
              </p>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="w-full text-xs text-gray-400 hover:text-gray-600 transition"
              >
                ← Edit Details
              </button>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || verifying}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
          >
            {loading ? "Sending OTP..." : verifying ? "Verifying..." : step === 1 ? "Next: Verify Email" : "Complete Registration"}
          </button>
        </form>

                     <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/seller/login")}
            className="text-blue-600 font-medium cursor-pointer"
          >
            Login
          </span>
        </p>

      </div>
    </SellerAuthLayout>
  );
};

export default SellerRegistration;