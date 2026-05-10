// import { ArrowLeft, Eye, EyeOff, LockIcon, User } from 'lucide-react';
// import React, { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// // ✅ FIXED API URL
// const API_URL = 'http://localhost:4000/api';  
// // const API_URL='https://expense-tracker-mern-rc86.onrender.com/api'


// const Signup = () => {

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);

//   const navigate = useNavigate();

//   // ✅ FORM VALIDATION (unchanged)
//   const validateForm = () => {
//     const newErrors = {};

//     if (!name.trim()) {
//       newErrors.name = "Name is required";
//     }
//     if (!email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       newErrors.email = "Email is invalid";
//     }
//     if (!password) {
//       newErrors.password = "Password is required";
//     } else if (password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // ✅ FIXED HANDLE SUBMIT
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors({});

//     if (!validateForm()) return;

//     setIsLoading(true);

//     try {
//       const res = await axios.post(
//         `${API_URL}/user/register`,   // ✅ FIXED (no double /api)
//         { name, email, password },
//         { headers: { "Content-Type": "application/json" } }
//       );

//       console.log("SIGNUP RESPONSE:", res.data);

//       const { token, user } = res.data;

//       // ✅ STORE TOKEN
//       if (token) {
//         localStorage.setItem("token", token);
//       }

//       // ✅ STORE USER
//       localStorage.setItem(
//         "user",
//         JSON.stringify(user || { name, email })
//       );

//       navigate("/");

//     } catch (err) {
//       console.error("Signup error:", err?.response || err);

//       if (err.response?.data?.errors) {
//         setErrors(err.response.data.errors);
//       } else if (err.response?.data?.message) {
//         setErrors({ api: err.response.data.message });
//       } else {
//         setErrors({ api: err.message || "Something went wrong" });
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-blue-100 px-4">

//       <div className="w-full max-w-md backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-6 sm:p-8">

//         {/* Header */}
//         <div className="text-center space-y-3 relative">

//           <button
//             onClick={() => navigate(-1)}
//             className="absolute left-0 top-0 p-2 rounded-full hover:bg-gray-200 transition"
//           >
//             <ArrowLeft className="w-5 h-5 text-gray-600" />
//           </button>

//           <div className="flex justify-center">
//             <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full shadow-lg">
//               <User className="w-8 h-8 text-white" />
//             </div>
//           </div>

//           <h1 className="text-3xl font-bold text-gray-800">
//             Create Account
//           </h1>

//           <p className="text-gray-500 text-sm">
//             Join ExpenseTracker to manage your finances
//           </p>
//         </div>

//         {/* API Error */}
//         {errors.api && (
//           <p className="mt-4 text-red-500 text-sm bg-red-100 p-2 rounded-lg text-center">
//             {errors.api}
//           </p>
//         )}

//         {/* Form */}
//         <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">

//           {/* Name */}
//           <div>
//             <label className="text-sm font-medium text-gray-700">
//               Full Name
//             </label>

//             <div className="flex items-center mt-1 px-3 py-2 rounded-xl bg-white/60 border border-gray-200 focus-within:ring-2 focus-within:ring-purple-500">
//               <User className="w-5 h-5 text-gray-400" />
//               <input
//                 className="w-full bg-transparent outline-none ml-2 text-sm"
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Aman Gupta"
//               />
//             </div>

//             {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
//           </div>

//           {/* Email */}
//           <div>
//             <label className="text-sm font-medium text-gray-700">
//               Email Address
//             </label>

//             <div className="flex items-center mt-1 px-3 py-2 rounded-xl bg-white/60 border border-gray-200 focus-within:ring-2 focus-within:ring-purple-500">
//               <LockIcon className="w-5 h-5 text-gray-400" />
//               <input
//                 className="w-full bg-transparent outline-none ml-2 text-sm"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="aman.dev@gmail.com"
//               />
//             </div>

//             {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
//           </div>

//           {/* Password */}
//           <div>
//             <label className="text-sm font-medium text-gray-700">
//               Password
//             </label>

//             <div className="flex items-center mt-1 px-3 py-2 rounded-xl bg-white/60 border border-gray-200 focus-within:ring-2 focus-within:ring-purple-500">
//               <User className="w-5 h-5 text-gray-400" />

//               <input
//                 className="w-full bg-transparent outline-none ml-2 text-sm"
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="•••••••••"
//               />

//               <button type="button" onClick={() => setShowPassword(!showPassword)}>
//                 {showPassword ? <EyeOff /> : <Eye />}
//               </button>
//             </div>

//             {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
//           </div>

//           {/* Remember */}
//           <div className="flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={rememberMe}
//               onChange={(e) => setRememberMe(e.target.checked)}
//               className="accent-purple-600"
//             />
//             <label className="text-gray-600">Remember Me</label>
//           </div>

//           {/* Button */}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className={`w-full py-2.5 rounded-xl font-semibold text-white 
//             bg-gradient-to-r from-purple-600 to-blue-600 
//             hover:from-purple-700 hover:to-blue-700 
//             shadow-md transition-all 
//             ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
//           >
//             {isLoading ? "Creating account..." : "Create Account"}
//           </button>
//         </form>

//         {/* Footer */}
//         <div className="text-center mt-6 text-sm text-gray-600">
//           <p>
//             Already have an account?{" "}
//             <Link to="/login" className="font-semibold text-blue-600 hover:underline">
//               Sign in
//             </Link>
//           </p>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Signup;





import { ArrowLeft, Eye, EyeOff, LockIcon, Mail, User } from 'lucide-react';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + "/api"; // ✅ FIXED

const Signup = ({onSignup}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/user/register`,
        { name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      // const { token, user } = res.data;

      // if (token) localStorage.setItem("token", token);
      // localStorage.setItem("user", JSON.stringify(user || { name, email }));
    const { token, user } = res.data;
  
  onSignup(user || { name, email }, rememberMe, token);
      navigate("/");
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setErrors({ api: err.response.data.message });
      } else {
        setErrors({ api: err.message || "Something went wrong" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-blue-100 px-4">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-6 sm:p-8">

        <div className="text-center space-y-3 relative">
          <button onClick={() => navigate(-1)} className="absolute left-0 top-0 p-2 rounded-full hover:bg-gray-200 transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm">Join ExpenseTracker to manage your finances</p>
        </div>

        {errors.api && (
          <p className="mt-4 text-red-500 text-sm bg-red-100 p-2 rounded-lg text-center">{errors.api}</p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <div className="flex items-center mt-1 px-3 py-2 rounded-xl bg-white/60 border border-gray-200 focus-within:ring-2 focus-within:ring-purple-500">
              <User className="w-5 h-5 text-gray-400" />
              <input className="w-full bg-transparent outline-none ml-2 text-sm" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aman Gupta" />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email — ✅ Mail icon fix */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <div className="flex items-center mt-1 px-3 py-2 rounded-xl bg-white/60 border border-gray-200 focus-within:ring-2 focus-within:ring-purple-500">
              <Mail className="w-5 h-5 text-gray-400" /> {/* ✅ FIXED */}
              <input className="w-full bg-transparent outline-none ml-2 text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aman.dev@gmail.com" />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="flex items-center mt-1 px-3 py-2 rounded-xl bg-white/60 border border-gray-200 focus-within:ring-2 focus-within:ring-purple-500">
              <LockIcon className="w-5 h-5 text-gray-400" />
              <input className="w-full bg-transparent outline-none ml-2 text-sm" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="•••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="accent-purple-600" />
            <label className="text-gray-600">Remember Me</label>
          </div>

          <button type="submit" disabled={isLoading}
            className={`w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md transition-all ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Already have an account?{" "}<Link to="/login" className="font-semibold text-blue-600 hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;