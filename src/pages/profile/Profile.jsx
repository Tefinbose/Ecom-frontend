import { useState } from "react";
import { User, Shield, Check } from "lucide-react";

const DEFAULT_PROFILE = {
  name: "Store Administrator",
  email: "admin@empirestore.com",
  role: "Super Admin",
  lastLogin: "Today, 10:45 AM"
};

function getStoredProfile() {
  try {
    const raw = localStorage.getItem("empire_admin_profile");
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_PROFILE;
}

export default function Profile() {
  const [profile, setProfile] = useState(getStoredProfile);
  const [message, setMessage] = useState("");

  function save(e) {
    e.preventDefault();
    try {
      localStorage.setItem("empire_admin_profile", JSON.stringify(profile));
    } catch {
      // ignore
    }
    setMessage("Profile details updated successfully.");
    setTimeout(() => setMessage(""), 3500);
  }

  return (
    <section className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your administrator credentials and account identity.
        </p>
      </div>

      {message && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-emerald-50 p-3.5 text-sm font-medium text-emerald-800 border border-emerald-200">
          <Check size={18} className="text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600 text-2xl border border-indigo-100">
          {profile.name.charAt(0) || "A"}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              <Shield size={12} /> {profile.role}
            </span>
            <span className="text-xs text-slate-400">• Last active {profile.lastLogin}</span>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">
          Full Name
          <div className="relative mt-2">
            <input
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </div>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Email Address
          <input
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed"
            value={profile.email}
            readOnly
          />
          <span className="mt-1 block text-xs text-slate-400">
            Email is managed by store ownership policies and cannot be modified directly.
          </span>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Role
          <input
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed"
            value={profile.role}
            readOnly
          />
        </label>

        <div className="pt-2">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
          >
            <User size={16} /> Save Changes
          </button>
        </div>
      </form>
    </section>
  );
}
