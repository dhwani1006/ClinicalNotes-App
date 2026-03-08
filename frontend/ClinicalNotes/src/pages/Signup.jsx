import { useState } from "react";
import { useNavigate } from "react-router-dom";
import doctorsImg from "../assets/doctors.png";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async () => {
    // ✅ Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully! Redirecting to login...");

      // Redirect to signin after short delay
      setTimeout(() => {
        navigate("/signin");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#f6f9ff] via-white to-[#eef4ff]" />
      <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full bg-blue-200/30 blur-[160px]" />
      <div className="absolute top-1/3 -right-48 w-[600px] h-[600px] rounded-full bg-blue-300/25 blur-[160px]" />

      {/* Main Card */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-3xl shadow-2xl bg-white/85 backdrop-blur-xl overflow-hidden">
        {/* Left side */}
        <div className="flex-1 bg-[#1877F2] text-white px-8 py-10 flex flex-col justify-center">
          <h1 className="text-3xl font-semibold mb-3">Clinical Notes</h1>
          <p className="text-blue-100 text-sm mb-8 max-w-sm">
            Secure, modern clinical documentation built for busy practices.
          </p>

          <div className="w-72 h-72 rounded-2xl bg-white shadow-xl overflow-hidden">
            <img
              src={doctorsImg}
              alt="Doctors"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 px-8 py-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            <p className="text-sm text-gray-600 mb-2">
              Already have an account?{" "}
              <a
                href="/signin"
                className="text-[#1877F2] font-medium hover:underline"
              >
                Sign in
              </a>
            </p>

            <h2 className="text-3xl font-semibold text-gray-900 mb-6">
              Create your account
            </h2>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">
                {success}
              </div>
            )}

            <input
              type="text"
              placeholder="Doctor Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 mb-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
            />

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 mb-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 mb-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 mb-5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
            />

            <button
              type="button"
              onClick={handleSignup}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1877F2] text-white font-semibold shadow-lg hover:bg-[#1664d4] transition disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
