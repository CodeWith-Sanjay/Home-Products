import { useState, useEffect } from "react";
import Card from "./Card";
import { updateCustomer } from "../../services/authService";

const ProfileSettings = ({ user }) => {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    profile_picture_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) setForm({
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : "",
      gender: user.gender || "",
      profile_picture_url: user.profile_picture_url || "",
    });
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await updateCustomer(user.customer_id, form);
      if (res.success) {
        setSuccess("Profile updated successfully!");
        
        // Update local storage so Navbar reflects changes
        const currentAuth = JSON.parse(localStorage.getItem("auth"));
        if (currentAuth) {
          localStorage.setItem("auth", JSON.stringify({
            ...currentAuth,
            name: form.full_name,
            profile_picture_url: form.profile_picture_url
          }));
        }
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";

  return (
    <Card title="Account Settings">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="John Doe"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className={inputClass}
              disabled
            />
            <p className="text-[10px] text-gray-400 ml-1 italic">*Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="1234567890"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={form.date_of_birth}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Profile Picture URL</label>
            <input
              name="profile_picture_url"
              value={form.profile_picture_url}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm font-medium border border-red-100">
            {error}
          </p>
        )}

        {success && (
          <p className="text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg text-sm font-medium border border-emerald-100">
            {success}
          </p>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full md:w-auto px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 transition-all duration-200 
              ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0"}`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileSettings;