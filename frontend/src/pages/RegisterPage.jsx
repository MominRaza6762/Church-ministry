import React, { useState } from "react";
import { registerApi } from "../api/authApi.js";
import { useAuthStore } from "../store/authStore.js";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "../components/Toast.jsx";

// ✅ Field defined OUTSIDE component — prevents re-creation on every render which caused focus loss
const Field = ({ label, name, type, placeholder, value, onChange, error, showPwd, onTogglePwd }) => (
  <div>
    <label className="block text-xs font-semibold text-texts uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <div className="relative">
      <input
        type={name === "password" ? (showPwd ? "text" : "password") : (type || "text")}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={name === "password" ? "new-password" : name === "email" ? "email" : "off"}
        className={`w-full bg-parchment border rounded-xl px-4 py-3 text-sm transition-all duration-200
          focus:bg-white focus:border-gold placeholder:text-texts/40
          ${error ? "border-danger/60 bg-danger/5" : "border-parchment-dark"}`}
      />
      {name === "password" && (
        <button
          type="button"
          onClick={onTogglePwd}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-texts hover:text-textp"
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
      )}
    </div>
    {error && <p className="text-danger text-xs mt-1">{error}</p>}
  </div>
);

const RegisterPage = () => {
  const setAccessToken = useAuthStore(s => s.setAccessToken);
  const setUser = useAuthStore(s => s.setUser);
  const [form, setForm] = useState({ email: "", password: "", name: "", parishName: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (!form.name.trim()) e.name = "Priest name is required";
    return e;
  };

  const handleChange = (name) => (e) => {
    setForm(prev => ({ ...prev, [name]: e.target.value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const data = await registerApi(form);
      setUser(data.user);
      setAccessToken(data.accessToken);
      toast.success("Account created! Welcome to Ministry Companion.");
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.error || "Registration failed";
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4 py-8 animate-fadeIn">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute text-burgundy text-8xl select-none"
            style={{ left: `${(i % 4) * 26}%`, top: `${Math.floor(i / 4) * 34}%` }}>✝</div>
        ))}
      </div>

      <div className="relative w-full max-w-[460px] animate-slideUp">
        <div className="bg-ivory rounded-2xl shadow-card border border-parchment-dark/40 overflow-hidden">
          <div className="bg-burgundy px-6 py-5 text-center">
            <div className="text-gold font-serif tracking-[0.2em] uppercase text-sm font-semibold">Create Account</div>
            <div className="text-ivory/70 text-xs mt-1">Join Ministry Companion</div>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={submit} noValidate className="space-y-4">
              <Field
                label="Email Address"
                name="email"
                type="email"
                placeholder="priest@parish.org"
                value={form.email}
                onChange={handleChange("email")}
                error={errors.email}
              />
              <Field
                label="Password (min. 8 characters)"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange("password")}
                error={errors.password}
                showPwd={showPwd}
                onTogglePwd={() => setShowPwd(p => !p)}
              />
              <Field
                label="Priest Name"
                name="name"
                placeholder="Fr. John Smith"
                value={form.name}
                onChange={handleChange("name")}
                error={errors.name}
              />
              <Field
                label="Parish Name (optional)"
                name="parishName"
                placeholder="Holy Trinity Parish"
                value={form.parishName}
                onChange={handleChange("parishName")}
                error={errors.parishName}
              />

              {errors.general && (
                <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-danger text-sm">
                  {errors.general}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-burgundy hover:bg-burgundy-dark text-ivory font-semibold tracking-widest uppercase text-sm
                  rounded-xl py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-nav
                  disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </>
                ) : "Create Account"}
              </button>
            </form>

            <div className="text-center mt-5">
              <Link to="/login" className="text-burgundy text-sm hover:text-burgundy-dark transition-colors font-medium">
                ← Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;