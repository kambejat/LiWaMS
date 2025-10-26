import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Modal from "../components/Modal";
import { motion } from "framer-motion";
import AddReadingModal from "../components/AddReadingModal";
import BillingSettingsModal from "../components/BillingSettingsModal";
import Loader from "../components/Loader";
import { useUser } from "../context/UserContext";
import icon from "../assets/Logo.png";
import { buttons } from "../helper/helper";

interface Bill {
  id: number;
  customer_id: number;
  customer: string;
  reading_id: number;
  billing_start: string;
  billing_end: string;
  consumption: number;
  fixed_charge: number;
  variable_charge: number;
  amount_due: number;
  due_date: string;
  status: string;
}

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

const BillsPage: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUser();
  

  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "cash",
    reference: "",
  });

  const [receipt, setReceipt] = useState<Receipt | null>(null);

  // Fetch bills
  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/billing/bills/");
      setBills(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Open Payment Modal
  const openPaymentModal = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentData({
      amount: bill.amount_due.toString(),
      method: "cash",
      reference: "",
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill || !user?.username) return;

    try {
      const amount = Number(paymentData.amount);
      const billId = selectedBill.id; // number
      const method = paymentData.method;
      const username = user.username;

      // Pass the billId as number if backend accepts number
      const payload = { bill_id: billId, amount, method, username };

      await axios.post("/payments/", payload);

      fetchBills();
      setIsPaymentModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Open Receipt Modal
  const openReceiptModal = async (paymentId: number) => {
    try {
      const res = await axios.get(`/receipts/${paymentId}`);
      setReceipt(res.data);
      setIsReceiptModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-0">
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={() => setIsReadingModalOpen(true)}
          className={buttons.blue}
        >
          + Add Reading
        </button>
        {user?.role === "admin" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className={buttons.blue}
          >
            Edit Billing Settings
          </button>
        )}
      </div>

      <BillingSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <AddReadingModal
        isOpen={isReadingModalOpen}
        onClose={() => setIsReadingModalOpen(false)}
        onSuccess={() => {
          console.log("Reading added!");
        }}
        fetchBills={fetchBills}
      />

      {loading ? (
        <Loader loading={loading} />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="bg-blue-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-4 py-2">Customer Name</th>
                <th className="px-4 py-2">Amount Due</th>
                <th className="px-4 py-2">Billing Period</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <motion.tr
                  key={bill.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{bill.customer}</td>
                  <td className="px-4 py-2">
                    MWK {bill.amount_due.toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    {bill.billing_start} - {bill.billing_end}
                  </td>
                  <td className="px-4 py-2 capitalize">{bill.status}</td>
                  <td className="px-4 py-2 flex gap-2">
                    {bill.status === "unpaid" && (
                      <button
                        onClick={() => openPaymentModal(bill)}
                        className={buttons.green}
                      >
                        Pay
                      </button>
                    )}
                    <button
                      onClick={() => openReceiptModal(bill.id)}
                      className={buttons.blue}
                    >
                      Receipt
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Pay Bill - Customer ${selectedBill?.customer_id}`}
      >
        <form onSubmit={handlePaymentSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              value={paymentData.amount}
              onChange={(e) =>
                setPaymentData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Method</label>
            <select
              name="method"
              value={paymentData.method}
              onChange={(e) =>
                setPaymentData((prev) => ({ ...prev, method: e.target.value }))
              }
              className="w-full border p-2 rounded"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="mobile">Mobile Money</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Reference</label>
            <input
              type="text"
              name="reference"
              value={paymentData.reference}
              onChange={(e) =>
                setPaymentData((prev) => ({
                  ...prev,
                  reference: e.target.value,
                }))
              }
              className="w-full border p-2 rounded"
            />
          </div>
          <button className={`w-full ${buttons.green}`}>
            Submit Payment
          </button>
        </form>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title={`Receipt - ${receipt?.receipt_no}`}
        width="max-w-md"
      >
        {receipt ? (
          <div className="flex justify-center bg-gray-50 rounded-md shadow-md">
            <div className="w-full rounded bg-white px-2 pt-2 pb-2 text-sm shadow-inner">
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

              {/* Divider */}
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

              {/* Divider */}
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

              {/* Divider */}
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
          </div>
        ) : (
          <Loader loading={loading} />
        )}
      </Modal>
    </div>
  );
};

export default BillsPage;
