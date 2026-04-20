import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { customerRegister, sendOtp, verifyOtp } from "../../services/authService";

const CustomerRegister = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    profile_picture_url: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (localStorage.getItem("seller")) {
      setError("A seller is already logged in. Please logout from the seller portal first.");
      return;
    }

    if (!form.full_name || !form.email || !form.phone || !form.password) {
      setError("All fields are required except profile picture");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Sending OTP to:", form.email);
      const res = await sendOtp({ email: form.email, purpose: "registration" });
      console.log("OTP Send Response:", res);
      if (res.success) {
        setStep(2);
      } else {
        setError(res.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("OTP Send Error:", err);
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || "Error sending OTP. Please check your internet connection.");
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
      const vRes = await verifyOtp({ email: form.email, otp, purpose: "registration" });
      if (!vRes.success) {
        setError(vRes.message || "Invalid OTP");
        setVerifying(false);
        return;
      }

      const res = await customerRegister({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        profile_picture_url: form.profile_picture_url,
        password: form.password,
      });

      if (!res.success) {
        setError(res.message);
        setVerifying(false);
        return;
      }

      localStorage.setItem("auth", JSON.stringify(res.data));
      navigate("/customer-onboarding");
    } catch (err) {
      setError("Something went wrong during registration");
    } finally {
      setVerifying(false);
    }
  };

  const inputClass = "w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10 relative overflow-hidden">
      <div className="w-full max-w-lg relative bg-white shadow-2xl rounded-3xl p-8 sm:p-10 border border-gray-100">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800">
          Create Account
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8 mt-2 font-medium">
          Join us and start your shopping journey
        </p>

        <form onSubmit={step === 1 ? handleSendOtp : handleVerifyAndRegister} className="space-y-5">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Full Name</label>
                <input
                  name="full_name"
                  placeholder="John Doe"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Mobile Number</label>
                <input
                  name="phone"
                  placeholder="1234567890"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Gender</label>
                  <select
                    name="gender"
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Profile Picture URL (Optional)</label>
                <input
                  name="profile_picture_url"
                  placeholder="https://example.com/image.jpg"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  We've sent a 6-digit verification code to <span className="font-bold text-gray-800">{form.email}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">Enter OTP</label>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`${inputClass} text-center text-2xl tracking-[1em] font-mono`}
                />
              </div>
              <p className="text-xs text-center text-gray-400">
                Didn't receive the code? <span className="text-blue-600 cursor-pointer hover:underline" onClick={handleSendOtp}>Resend OTP</span>
              </p>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="w-full text-sm text-gray-500 font-medium hover:text-gray-700 transition"
              >
                ← Back to Edit Details
              </button>
            </div>
          )}

          {error && (
            <p className="text-red-600 bg-red-50 px-3 py-2 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || verifying}
            className={`w-full py-4 mt-4 rounded-xl text-white font-extrabold text-lg bg-blue-600 shadow-lg shadow-blue-200 transition-all duration-300
              ${
                (loading || verifying)
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              }`}
          >
            {loading ? "Sending OTP..." : verifying ? "Verifying..." : step === 1 ? "Next: Verify Email" : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center mt-8 text-gray-600 font-medium">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/customer-login")}
            className="text-blue-600 font-bold cursor-pointer hover:underline decoration-2 underline-offset-4"
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default CustomerRegister;
