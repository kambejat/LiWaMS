import { useEffect, useState } from "react";
import axios from "../api/axios";
import { motion } from "framer-motion";

interface BillingSettings {
  fixed_charge: number | string;
  rate_per_unit: number | string;
}

interface BillingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BillingSettingsModal({
  isOpen,
  onClose,
}: BillingSettingsModalProps) {
  const [settings, setSettings] = useState<BillingSettings>({
    fixed_charge: "",
    rate_per_unit: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (isOpen) fetchSettings();
  }, [isOpen]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get<BillingSettings>("/billing_settings/");
      setSettings({
        fixed_charge: res.data.fixed_charge,
        rate_per_unit: res.data.rate_per_unit,
      });
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Failed to fetch billing settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put("/billing_settings/", settings);
      setMessage("✅ Settings updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update settings.");
    } finally {
      onClose()
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Billing Settings
        </h2>

        {loading ? (
          <div className="flex justify-center py-6 text-gray-600">
            Loading...
          </div>
        ) : (
          <>
            <label className="block mb-3">
              <span className="text-gray-700 text-sm">Fixed Charge (MWK)</span>
              <input
                type="number"
                value={settings.fixed_charge}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    fixed_charge: e.target.value,
                  })
                }
                className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
              />
            </label>

            <label className="block mb-4">
              <span className="text-gray-700 text-sm">
                Rate per Unit (MWK)
              </span>
              <input
                type="number"
                value={settings.rate_per_unit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    rate_per_unit: e.target.value,
                  })
                }
                className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
              />
            </label>

            {message && (
              <p className="text-center text-sm text-gray-600 mb-3">
                {message}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
