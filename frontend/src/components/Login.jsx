import { Eye, EyeOff, Mail, User } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { FaLock } from "react-icons/fa";
import axios from "axios";
import { Link } from 'react-router-dom';

// const API_URL = 'http://localhost:4000/api';
const API_URL = import.meta.env.VITE_API_URL + "/api";

const Login = ({onLogin}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/user/login`, {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      // const { token, user } = res.data;

      // if (!token) {
      //   setError("Login failed: No token received");
      //   return;
      // }
const { token, user } = res.data;
  if (!token) { setError("Login failed: No token received");
     return; 
    }
  
  onLogin(user, rememberMe, token);
      // ✅ FIXED AUTH STORAGE
      // localStorage.setItem("token", token);
      // localStorage.setItem("user", JSON.stringify(user));

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("TOKEN SAVED:", localStorage.getItem("token"));

      navigate("/");

    } catch (err) {
      console.error("Login error:", err?.response || err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4">
      
      <div className="w-full max-w-md backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-6 sm:p-8 transition-all duration-300">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Welcome Back
          </h1>

          <p className="text-gray-500 text-sm">
            Sign in to your ExpenseTracker account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-100/80 backdrop-blur p-3 rounded-xl mt-5 border border-red-200 text-red-600 animate-pulse">
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-6">

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email Address
            </label>

            <div className="flex items-center mt-1 px-3 py-2 rounded-xl bg-white/60 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <Mail className="w-5 h-5 text-gray-400" />
              <input
                className="w-full bg-transparent outline-none ml-2 text-sm"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aman.tara@gmail.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="flex items-center mt-1 px-3 py-2 rounded-xl bg-white/60 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <FaLock className="w-5 h-5 text-gray-400" />

              <input
                className="w-full bg-transparent outline-none ml-2 text-sm"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Remember */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-purple-600"
              />
              <label className="text-gray-600">Remember Me</label>
            </div>

            <span className="text-blue-500 cursor-pointer hover:underline">
              Forgot?
            </span>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 rounded-xl font-semibold text-white 
            bg-gradient-to-r from-blue-600 to-purple-600 
            hover:from-blue-700 hover:to-purple-700 
            shadow-md transition-all duration-300 
            ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Don't have an account{" "}
            <Link to="/signup" className="font-semibold text-purple-600 hover:underline">
              Create One
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
