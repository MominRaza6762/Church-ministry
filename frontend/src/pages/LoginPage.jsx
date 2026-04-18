import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore.js";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "../components/Toast.jsx";

const LoginPage = () => {
  const login = useAuthStore(s => s.login);
  const user = useAuthStore(s => s.user);
  const loading = useAuthStore(s => s.loading);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user]);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    const result = await login(form.email, form.password);
    if (result.ok) {
      toast.success("Welcome back! Entering your journal...");
      navigate("/dashboard");
    } else {
      toast.error(result.msg || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4 animate-fadeIn">
      {/* Background cross pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute text-burgundy text-8xl select-none"
            style={{ left: `${(i % 4) * 26}%`, top: `${Math.floor(i / 4) * 34}%` }}>✝</div>
        ))}
      </div>

      <div className="relative w-full max-w-[420px] animate-slideUp">
        {/* Card */}
        <div className="bg-ivory rounded-2xl shadow-card border border-parchment-dark/40 overflow-hidden">
          {/* Header band */}
          <div className="bg-burgundy px-6 py-6 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-burgundy-dark/60 border-2 border-gold/40 flex items-center justify-center shadow-lg">
              <img
                src="https://res.cloudinary.com/proxmaircloud/image/upload/v1775580188/images/zlrd9m2fgrbmjmxuhzef.png"
                alt="Cross"
                className="w-8 h-8 object-contain"
                onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }}
              />
              <span className="text-gold text-2xl hidden">✝</span>
            </div>
            {/* Change 2: updated sub-name */}
            <div className="text-gold font-serif tracking-[0.2em] uppercase text-sm font-semibold">
              Ministry Companion
            </div>
            <div className="text-ivory/70 text-xs mt-1">
              +Daily Office Journal for Orthodox Christian Clergy+
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-6">
            <p className="text-texts text-sm text-center mb-5">Sign in to your daily office journal</p>

            <form onSubmit={submit} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-texts uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                  placeholder="priest@parish.org"
                  className={`w-full bg-parchment border rounded-xl px-4 py-3 text-sm transition-all duration-200
                    focus:bg-white focus:border-gold placeholder:text-texts/40
                    ${errors.email ? "border-danger/60 bg-danger/5" : "border-parchment-dark"}`}
                />
                {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-texts uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }); }}
                    placeholder="••••••••"
                    className={`w-full bg-parchment border rounded-xl px-4 py-3 text-sm pr-10 transition-all duration-200
                      focus:bg-white focus:border-gold placeholder:text-texts/40
                      ${errors.password ? "border-danger/60 bg-danger/5" : "border-parchment-dark"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-texts hover:text-textp transition-colors"
                    tabIndex={-1}
                  >
                    {showPwd ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-burgundy hover:bg-burgundy-dark text-ivory font-semibold tracking-widest uppercase text-sm
                  rounded-xl py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-nav
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing In...
                  </>
                ) : "Enter Journal"}
              </button>
            </form>

            <div className="text-center mt-5">
              <Link to="/register" className="text-burgundy text-sm hover:text-burgundy-dark transition-colors font-medium">
                Create an account →
              </Link>
            </div>
          </div>

          {/* Change 1: Footer quote with Matt. 18:20 citation */}
          <div className="bg-parchment/60 px-6 py-3 border-t border-parchment-dark/30 text-center">
            <p className="text-texts text-xs italic">
              "For where two or three are gathered in my name, there am I in the midst of them."
            </p>
            <p className="text-texts/60 text-xs mt-0.5 not-italic font-medium">— Matt. 18:20</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;