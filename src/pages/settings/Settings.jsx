import { useState } from "react";
import { Check, Settings as SettingsIcon } from "lucide-react";

const defaults = {
  storeName: "Empire Store",
  currency: "INR",
  lowStockThreshold: 5,
  notifications: true,
  taxRate: 18,
};

function getStoredSettings() {
  try {
    const value = localStorage.getItem("adminSettings");
    if (value) return { ...defaults, ...JSON.parse(value) };
  } catch {
    // ignore
  }
  return defaults;
}

export default function Settings() {
  const [settings, setSettings] = useState(getStoredSettings);
  const [saved, setSaved] = useState(false);

  function save(e) {
    e.preventDefault();
    try {
      localStorage.setItem("adminSettings", JSON.stringify(settings));
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <section className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Store Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure general store preferences, localization, and automated alerts.
        </p>
      </div>

      {saved && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-emerald-50 p-3.5 text-sm font-medium text-emerald-800 border border-emerald-200">
          <Check size={18} className="text-emerald-600" />
          <span>Preferences saved successfully in your local browser settings.</span>
        </div>
      )}

      <form onSubmit={save} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">
          Store Name
          <input
            className="mt-2 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
            value={settings.storeName}
            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Base Currency
          <select
            className="mt-2 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors bg-white"
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
          >
            <option value="INR">INR — Indian Rupee (₹)</option>
            <option value="USD">USD — US Dollar ($)</option>
            <option value="EUR">EUR — Euro (€)</option>
            <option value="AED">AED — UAE Dirham (AED)</option>
          </select>
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Low-Stock Alert Threshold
            <input
              type="number"
              min="1"
              max="100"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
              value={settings.lowStockThreshold}
              onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) || 0 })}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Default GST / VAT Rate (%)
            <input
              type="number"
              min="0"
              max="50"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
              value={settings.taxRate}
              onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) || 0 })}
            />
          </label>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              checked={settings.notifications}
              onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
            />
            <span>Enable in-app notifications for pending orders and low-stock items</span>
          </label>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
          >
            <SettingsIcon size={16} /> Save Settings
          </button>
        </div>
      </form>
    </section>
  );
}
