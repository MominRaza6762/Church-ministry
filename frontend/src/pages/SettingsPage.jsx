import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import { useAuthStore } from "../store/authStore.js";
import { updateProfileApi } from "../api/userApi.js";
import { changePasswordApi } from "../api/authApi.js";
import { startGoogleOAuth, calendarStatusApi, disconnectCalendarApi } from "../api/calendarApi.js";
import { toast } from "../components/Toast.jsx";
import { useLocation, useNavigate } from "react-router-dom";

const SectionCard = ({ title, icon, children }) => (
  <div className="bg-ivory rounded-2xl shadow-card border border-parchment-dark/30 overflow-hidden">
    <div className="bg-gradient-to-r from-parchment to-ivory px-5 py-3 border-b border-parchment-dark/30 flex items-center gap-2">
      <span className="text-base">{icon}</span>
      <span className="font-serif text-burgundy text-sm font-semibold">{title}</span>
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

const InputField = ({ label, type = "text", value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-texts uppercase tracking-wider mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-parchment border border-parchment-dark rounded-xl px-4 py-2.5 text-sm
        focus:bg-white focus:border-gold transition-all duration-200"
    />
  </div>
);

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const SettingsPage = () => {
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: user?.name || "", parishName: user?.parishName || "" });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [connectingCal, setConnectingCal] = useState(false);
  const [disconnectingCal, setDisconnectingCal] = useState(false);
  const [calConnected, setCalConnected] = useState(user?.googleCalendarConnected || false);
  const [checkingCal, setCheckingCal] = useState(false);

  // On mount: check if returning from Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const gcal = params.get("gcal");

    if (gcal === "connected") {
      // Remove query param from URL cleanly
      navigate("/settings", { replace: true });
      // Verify connection with backend
      checkCalendarStatus(true);
    } else {
      // Normal load — just check status silently
      checkCalendarStatus(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkCalendarStatus = async (showToast = false) => {
    setCheckingCal(true);
    try {
      const data = await calendarStatusApi();
      setCalConnected(data.connected || false);
      if (showToast) {
        if (data.connected) {
          toast.success("Google Calendar connected successfully! ✓");
        } else {
          toast.error("Google Calendar connection could not be verified. Please try again.");
        }
      }
    } catch {
      if (showToast) toast.error("Could not verify Google Calendar connection.");
    } finally {
      setCheckingCal(false);
    }
  };

  const saveProfile = async () => {
    if (!form.name.trim()) { toast.error("Priest name cannot be empty"); return; }
    setSavingProfile(true);
    try {
      const data = await updateProfileApi(form);
      setUser({ ...data.user, googleCalendarConnected: calConnected });
      toast.success("Profile saved successfully ✓");
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!pwd.currentPassword) { toast.error("Current password is required"); return; }
    if (pwd.newPassword.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    if (pwd.newPassword !== pwd.confirmPassword) { toast.error("Passwords do not match"); return; }
    setSavingPwd(true);
    try {
      await changePasswordApi({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      toast.success("Password changed successfully ✓");
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to change password");
    } finally {
      setSavingPwd(false);
    }
  };

  const connectGoogleCalendar = async () => {
    setConnectingCal(true);
    try {
      await startGoogleOAuth();
      // page will redirect — no further action
    } catch (e) {
      toast.error(e?.message || "Failed to start Google Calendar connection");
      setConnectingCal(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    setDisconnectingCal(true);
    try {
      await disconnectCalendarApi();
      setCalConnected(false);
      toast.success("Google Calendar disconnected.");
    } catch {
      toast.error("Failed to disconnect Google Calendar");
    } finally {
      setDisconnectingCal(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment">
      <Header date={new Date()} />
      <div className="mx-auto max-w-[640px] px-3 py-4 space-y-3 animate-fadeIn">

        {/* Profile */}
        <SectionCard title="Profile" icon="👤">
          <div className="space-y-3">
            <InputField
              label="Priest Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Fr. John Smith"
            />
            <InputField
              label="Parish Name"
              value={form.parishName}
              onChange={(e) => setForm({ ...form, parishName: e.target.value })}
              placeholder="Holy Trinity Parish"
            />
            <button
              onClick={saveProfile}
              disabled={savingProfile}
              className="flex items-center gap-2 px-5 py-2.5 bg-burgundy hover:bg-burgundy-dark text-ivory text-sm font-medium rounded-xl
                transition-all hover:-translate-y-0.5 hover:shadow-nav disabled:opacity-60 disabled:translate-y-0"
            >
              {savingProfile ? <><Spinner /> Saving...</> : "Save Profile"}
            </button>
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard title="Security" icon="🔒">
          <div className="space-y-3">
            <InputField
              label="Current Password"
              type={showPwd ? "text" : "password"}
              value={pwd.currentPassword}
              onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
              placeholder="••••••••"
            />
            <InputField
              label="New Password (min. 8 characters)"
              type={showPwd ? "text" : "password"}
              value={pwd.newPassword}
              onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
              placeholder="••••••••"
            />
            <InputField
              label="Confirm New Password"
              type={showPwd ? "text" : "password"}
              value={pwd.confirmPassword}
              onChange={(e) => setPwd({ ...pwd, confirmPassword: e.target.value })}
              placeholder="••••••••"
            />
            <label className="flex items-center gap-2 text-sm text-texts cursor-pointer select-none">
              <input type="checkbox" checked={showPwd} onChange={() => setShowPwd(!showPwd)} className="accent-burgundy" />
              Show passwords
            </label>
            <button
              onClick={changePassword}
              disabled={savingPwd}
              className="flex items-center gap-2 px-5 py-2.5 bg-navy hover:bg-navy/80 text-ivory text-sm font-medium rounded-xl
                transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
            >
              {savingPwd ? <><Spinner /> Changing...</> : "Change Password"}
            </button>
          </div>
        </SectionCard>

        {/* Google Calendar */}
        <SectionCard title="Google Calendar" icon="📅">
          <div className="space-y-4">
            {/* Status indicator */}
            <div className="flex items-center gap-3 bg-parchment rounded-xl px-4 py-3 border border-parchment-dark/30">
              {checkingCal ? (
                <>
                  <Spinner />
                  <span className="text-texts text-sm">Checking connection status...</span>
                </>
              ) : calConnected ? (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse flex-shrink-0" />
                  <div>
                    <div className="text-success text-sm font-medium">Connected</div>
                    <div className="text-texts text-xs">Google Calendar is synced with your Daily Schedule</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-texts/40 flex-shrink-0" />
                  <div>
                    <div className="text-textp text-sm font-medium">Not connected</div>
                    <div className="text-texts text-xs">Connect to auto-fill your Daily Schedule with calendar events</div>
                  </div>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              {!calConnected ? (
                <button
                  disabled={connectingCal || checkingCal}
                  onClick={connectGoogleCalendar}
                  className="flex items-center gap-2 px-5 py-2.5 bg-parchment border border-parchment-dark hover:bg-parchment-dark
                    text-textp text-sm font-medium rounded-xl transition-all hover:-translate-y-0.5
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {connectingCal ? (
                    <><Spinner /> Redirecting to Google...</>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm.14 19.018c-3.868 0-7-3.14-7-7.018 0-3.878 3.132-7.018 7-7.018 1.89 0 3.47.697 4.682 1.829l-1.974 1.978v-.004c-.735-.702-1.667-1.062-2.708-1.062-2.31 0-4.187 1.956-4.187 4.273 0 2.315 1.877 4.277 4.187 4.277 2.096 0 3.522-1.202 3.816-2.852H12.14v-2.737h6.585c.088.47.135.96.135 1.474 0 4.01-2.677 6.86-6.72 6.86z"/>
                      </svg>
                      Connect Google Calendar
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => checkCalendarStatus(false)}
                    disabled={checkingCal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-parchment border border-parchment-dark hover:bg-parchment-dark
                      text-textp text-sm rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {checkingCal ? <Spinner /> : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    Refresh Status
                  </button>
                  <button
                    onClick={disconnectGoogleCalendar}
                    disabled={disconnectingCal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-danger/10 border border-danger/30 hover:bg-danger/20
                      text-danger text-sm rounded-xl transition-all disabled:opacity-60"
                  >
                    {disconnectingCal ? <><Spinner /> Disconnecting...</> : "Disconnect"}
                  </button>
                </>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Account info */}
        <SectionCard title="Account" icon="✦">
          <div className="space-y-0 text-sm">
            <div className="flex justify-between py-2 border-b border-parchment-dark/30">
              <span className="text-texts">Email</span>
              <span className="text-textp font-medium">{user?.email || "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-parchment-dark/30">
              <span className="text-texts">Role</span>
              <span className="text-textp font-medium capitalize">{user?.role || "priest"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-texts">Plan</span>
              <span className="px-2 py-0.5 bg-gold/20 text-gold/80 rounded-full text-xs font-semibold">Free</span>
            </div>
          </div>
        </SectionCard>

      </div>
    </div>
  );
};

export default SettingsPage;
