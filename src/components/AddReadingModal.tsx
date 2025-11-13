import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import axios from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { buttons } from "../helper/helper";

interface AddReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fetchBills: () => void;
}

interface MeterResult {
  id: number;
  meter_no: string;
  status: string;
}

const AddReadingModal: React.FC<AddReadingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  fetchBills
}) => {
  const [formData, setFormData] = useState({
    meter_id: "",
    reading_date: "",
    reading_value: "",
  });

  const [meterQuery, setMeterQuery] = useState("");
  const [meterResults, setMeterResults] = useState<MeterResult[]>([]);
  const [loadingMeters, setLoadingMeters] = useState(false);

  const [loading, setLoading] = useState(false);

  // 🔁 Debounce meter search
  useEffect(() => {
    const delay = setTimeout(() => {
      if (meterQuery.trim()) {
        fetchMeters(meterQuery);
      } else {
        setMeterResults([]);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delay);
  }, [meterQuery]);

  const fetchMeters = async (query: string) => {
    try {
      setLoadingMeters(true);
      const res = await axios.get(
        `/meters/search?q=${encodeURIComponent(query)}`
      );
      setMeterResults(res.data || []);
    } catch (err) {
      console.error(err);
      setMeterResults([]);
    } finally {
      setLoadingMeters(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.meter_id) return alert("Please select a meter number");

    try {
      setLoading(true);
      await axios.post("/readings/", {
        meter_id: Number(formData.meter_id),
        reading_date: formData.reading_date,
        reading_value: Number(formData.reading_value),
      });
      onSuccess();
      onClose();
      fetchBills()
      setFormData({ meter_id: "", reading_date: "", reading_value: "" });
      setMeterQuery("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      fetchBills()
      onClose()
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Reading">
      <form onSubmit={handleSubmit} className="space-y-4 relative">
       
        <div className="relative">
          <label className="block mb-1">Search Meter Number</label>
          <input
            type="text"
            value={meterQuery}
            onChange={(e) => setMeterQuery(e.target.value)}
            placeholder="Type meter number..."
            className="w-full border p-2 rounded"
          />
          {loadingMeters && (
            <svg
              className="animate-spin absolute right-3 top-9 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}

          {/* Dropdown Results */}
          <AnimatePresence>
            {meterResults.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto"
              >
                {meterResults.map((m) => (
                  <li
                    key={m.id}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        meter_id: m.id.toString(),
                      }));
                      setMeterQuery(m.meter_no);
                      setMeterResults([]);
                    }}
                    className="p-2 hover:bg-green-50 cursor-pointer flex justify-between"
                  >
                    <span>{m.meter_no}</span>
                    <span
                      className={`text-xs ${
                        m.status === "active"
                          ? "text-green-500"
                          : "text-red-400"
                      }`}
                    >
                      {m.status}
                    </span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Date and Value */}
        <div>
          <label className="block mb-1">Reading Date</label>
          <input
            type="date"
            name="reading_date"
            value={formData.reading_date}
            onChange={(e) =>
              setFormData({ ...formData, reading_date: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Reading Value</label>
          <input
            type="number"
            name="reading_value"
            value={formData.reading_value}
            onChange={(e) =>
              setFormData({ ...formData, reading_value: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${buttons.blue}`}
        >
          {loading ? "Saving..." : "Save Reading"}
        </button>
      </form>
    </Modal>
  );
};

export default AddReadingModal;
