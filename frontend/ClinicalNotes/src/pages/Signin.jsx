import { useState } from "react";
import { useNavigate } from "react-router-dom";
import doctorsImg from "../assets/doctors.png";

export default function Signin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
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
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              Welcome back
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="text-[#1877F2] font-medium hover:underline"
              >
                Create one
              </a>
            </p>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </div>
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#1877F2] focus:outline-none"
            />

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1877F2] text-white font-semibold shadow-lg hover:bg-[#1664d4] transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
