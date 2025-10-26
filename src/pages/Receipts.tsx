import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import icon from "../assets/Logo.png";

interface ReceiptData {
  amount_paid: number;
  bill_id: number;
  cashier: string;
  customer: string;
  datetime: string;
  method: string;
}

interface Receipt {
  id: number;
  payment_id: number;
  receipt_no: string;
  issued_at: string;
  receipt_data: ReceiptData;
}

export default function Receipts() {
  const [receiptId, setReceiptId] = useState<string>("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptId.trim()) return;

    try {
      setLoading(true);
      setNotFound(false);
      const res = await api.get<Receipt>(`/receipts/${receiptId}`);
      setReceipt(res.data);
    } catch (err) {
      console.error("Failed to fetch receipt:", err);
      setReceipt(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // restore React state
  };

  return (
    <div className="mt-1">
      <h1 className="text-2xl font-bold text-green-700 mb-6 ">
        Find Receipt
      </h1>

      <motion.form
        onSubmit={handleFetch}
        className="flex justify-start items-start gap-2 mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <input
          className="border p-2 rounded w-48 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Receipt ID"
          value={receiptId}
          onChange={(e) => setReceiptId(e.target.value)}
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {loading ? "Loading..." : "Find"}
        </motion.button>
      </motion.form>

      <AnimatePresence>
        {notFound && (
          <motion.p
            className="text-red-600 text-sm mt-2"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            ❌ Receipt not found. Please check the ID and try again.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {receipt && (
          <motion.div
            ref={printRef}
            className="flex justify-center bg-gray-50 rounded-md shadow-md p-2 print:p-0 print:shadow-none print:bg-white"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-full rounded bg-white px-2 pt-2 pb-2 text-sm shadow-inner print:shadow-none">
              {/* Header / Logo */}
              <div className="flex flex-col items-center text-center gap-1">
                <img
                  src={icon}
                  alt="Company Logo"
                  className="mx-auto w-14 h-14 object-contain"
                />
                <h4 className="font-semibold text-gray-800">
                  Water Billing System
                </h4>
                <p className="text-xs text-gray-500">
                  1234 Water Lane, Blantyre
                </p>
                <p className="text-xs text-gray-500">info@wbs.example.com</p>
              </div>

              <div className="border-b border-dashed my-4"></div>

              {/* Receipt Info */}
              <div className="flex flex-col gap-2 text-xs">
                <p className="flex justify-between">
                  <span className="text-gray-400">Receipt No.:</span>
                  <span>{receipt.receipt_no}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Issued At:</span>
                  <span>{new Date(receipt.issued_at).toLocaleString()}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Payment ID:</span>
                  <span>{receipt.payment_id}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Cashier:</span>
                  <span>{receipt.receipt_data.cashier}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Customer:</span>
                  <span>{receipt.receipt_data.customer}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Method:</span>
                  <span>{receipt.receipt_data.method}</span>
                </p>
              </div>

              <div className="border-b border-dashed my-4"></div>

              {/* Summary */}
              <div className="text-xs">
                <div className="flex justify-between font-semibold text-gray-800 py-2">
                  <span>Total Paid:</span>
                  <span className="text-green-600">
                    MWK{" "}
                    {Number(receipt.receipt_data.amount_paid).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-b border-dashed my-4"></div>

              {/* Footer */}
              <div className="flex flex-col items-center justify-center gap-2 text-xs text-gray-500">
                <p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="inline mr-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  info@wbs.example.com
                </p>
                <p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="inline mr-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  +265 999 123 456
                </p>
                <p className="mt-2 text-gray-400 text-[10px]">
                  Thank you for your payment 💧
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {receipt && (
        <div className="text-center mt-4 print:hidden">
          <motion.button
            onClick={handlePrint}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            🖨️ Print Receipt
          </motion.button>
        </div>
      )}
    </div>
  );
}
