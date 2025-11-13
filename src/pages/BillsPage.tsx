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
import type { Bill, CustomerBillGroup } from "../types/billing";

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
  const [bills, setBills] = useState<CustomerBillGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCustomer, setExpandedCustomer] = useState<number | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unpaidReceipt, setUnpaidReceipt] = useState<Bill | null>(null);
  const [isUnpaidReceiptModalOpen, setIsUnpaidReceiptModalOpen] =
    useState(false);

  const { user } = useUser();

  const openUnpaidReceiptModal = (bill: Bill) => {
    setUnpaidReceipt(bill);
    setIsUnpaidReceiptModalOpen(true);
  };

  const handlePrintUnpaidReceipt = () => {
    const printContents = document.getElementById(
      "unpaid-receipt-print"
    )?.innerHTML;
    if (printContents) {
      const newWin = window.open("", "", "width=600,height=800");
      newWin?.document.write(printContents);
      newWin?.document.close();
      newWin?.print();
    }
  };

  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "cash",
    reference: "",
  });

  const [receipt, setReceipt] = useState<Receipt | null>(null);

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

  const toggleHistory = (customerId: number) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

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
      const payload = {
        bill_id: selectedBill.id,
        amount,
        method: paymentData.method,
        username: user.username,
      };

      await axios.post("/payments/", payload);
      fetchBills();
      setIsPaymentModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openReceiptModal = async (paymentId: number) => {
    try {
      const res = await axios.get(`/receipts/${paymentId}`);
      setReceipt(res.data);
      setIsReceiptModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintReceipt = () => {
    const printContents = document.getElementById("receipt-print")?.innerHTML;
    if (printContents) {
      const newWin = window.open("", "", "width=600,height=800");
      newWin?.document.write(printContents);
      newWin?.document.close();
      newWin?.print();
    }
  };

   // Filter bills based on search term
  const filteredBills = bills.filter((group) =>
    group.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.bills.some((b) =>
      b.meter_number.toFixed().includes(searchTerm.toLowerCase())
    )
  );

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
          <button onClick={() => setIsModalOpen(true)} className={buttons.blue}>
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
        fetchBills={fetchBills}
        onSuccess={() => setIsReadingModalOpen(false)}
      />
{loading ? (
  <Loader loading={loading} />
) : (
  <div className="overflow-x-auto bg-white shadow rounded">
    <table className="w-full text-sm text-left text-gray-500">
      <thead className="bg-blue-50 text-xs uppercase text-gray-700">
        <tr>
          <th className="px-4 py-2">Customer Name</th>
          <th className="px-4 py-2">Billing Period</th>
          <th className="px-4 py-2">Total Due</th>
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>

      <tbody>
        {bills.map((group) => (
          <React.Fragment key={group.customer_id}>
            <tr className="border-b bg-gray-50 hover:bg-gray-100">
              <td className="px-4 py-2 font-medium">{group.customer}</td>
              <td className="px-4 py-2">
                {group.billing_period
                  ? group.billing_period.replace("T", " ")
                  : "N/A"}
              </td>
              <td className="px-4 py-2 text-green-700 font-semibold">
                MWK {group.total_amount_due.toLocaleString()}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => toggleHistory(group.customer_id)}
                  className={buttons.blue}
                >
                  {expandedCustomer === group.customer_id
                    ? "Hide History"
                    : "View History"}
                </button>
              </td>
            </tr>

            {expandedCustomer === group.customer_id && (
              <tr>
                <td colSpan={4} className="px-6 py-4 bg-white">
                  <table className="w-full text-xs border rounded-md">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2">Period</th>
                        <th className="p-2">Previous Reading</th>
                        <th className="p-2">Current Reading</th>
                        <th className="p-2">Consumption</th>
                        <th className="p-2">Amount</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.bills.map((b) => (
                        <tr key={b.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            {b.billing_start} - {b.billing_end}
                          </td>
                          <td className="p-2">{b.previous_reading}</td>
                          <td className="p-2">{b.total_reading}</td>
                          <td className="p-2">{b.consumption}</td>
                          <td className="p-2">
                            MWK {b.amount_due.toLocaleString()}
                          </td>
                          <td className="p-2 capitalize">{b.status}</td>
                          <td className="p-2 flex gap-2">
                            {b.status === "unpaid" && (
                              <>
                                <button
                                  onClick={() => openPaymentModal(b)}
                                  className={buttons.green}
                                >
                                  Pay
                                </button>
                                <button
                                  onClick={() =>
                                    openUnpaidReceiptModal(b)
                                  }
                                  className={`${buttons.blue} print:hidden`}
                                >
                                  Receipt
                                </button>
                              </>
                            )}
                            {b.status === "paid" && (
                              <button
                                onClick={() => openReceiptModal(b.id)}
                                className={`${buttons.blue} print:hidden`}
                              >
                                Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
)}

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Pay Bill"
      >
        <form onSubmit={handlePaymentSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Amount</label>
            <input
              type="number"
              value={paymentData.amount}
              onChange={(e) =>
                setPaymentData({ ...paymentData, amount: e.target.value })
              }
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Method</label>
            <select
              value={paymentData.method}
              onChange={(e) =>
                setPaymentData({ ...paymentData, method: e.target.value })
              }
              className="w-full border p-2 rounded"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="mobile">Mobile Money</option>
            </select>
          </div>
          <button className={`w-full ${buttons.green}`}>Submit Payment</button>
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
          <div
            id="receipt-print"
            className="flex flex-col items-center bg-gray-50 rounded-md shadow-md p-4"
          >
            <img
              src={icon}
              alt="Company Logo"
              className="w-16 h-16 object-contain mb-2"
            />
            <h4 className="font-semibold text-gray-800">
              Water Billing System
            </h4>
            <p className="text-xs text-gray-500 mb-2">Blantyre, Malawi</p>
            <div className="w-full text-xs">
              <p>Receipt No: {receipt.receipt_no}</p>
              <p>Issued: {new Date(receipt.issued_at).toLocaleString()}</p>
              <p>Cashier: {receipt.receipt_data.cashier}</p>
              <p>Customer: {receipt.receipt_data.customer}</p>
              {/* <p>Meter Number: {}</p> */}
              <p>Method: {receipt.receipt_data.method}</p>
            </div>
            <hr className="my-2 w-full border-dashed" />
            <p className="font-semibold text-gray-700">
              Total Paid: MWK{" "}
              {receipt.receipt_data.amount_paid.toLocaleString()}
            </p>
            <p>Total Consumption: {selectedBill?.consumption ?? 0} m³</p>
            <button
              onClick={handlePrintReceipt}
              className={`${buttons.blue} mt-3 print:hidden`}
            >
              Print Receipt
            </button>
          </div>
        ) : (
          <Loader loading={loading} />
        )}
      </Modal>
      <Modal
        isOpen={isUnpaidReceiptModalOpen}
        onClose={() => setIsUnpaidReceiptModalOpen(false)}
        title={`Unpaid Receipt - ${unpaidReceipt?.customer}`}
        width="max-w-md"
      >
        {unpaidReceipt && (
          <div
            id="unpaid-receipt-print"
            className="flex flex-col items-center bg-gray-50 rounded-md shadow-md p-4"
          >
            <img
              src={icon}
              alt="Company Logo"
              className="w-16 h-16 object-contain mb-2"
            />
            <h4 className="font-semibold text-gray-800">
              Water Billing System
            </h4>
            <p className="text-xs text-gray-500 mb-2">Blantyre, Malawi</p>
            <div className="w-full text-xs">
              <p>Customer: {unpaidReceipt.customer}</p>
              <p>Meter Number {unpaidReceipt.meter_number}</p>
              <p>
                Billing Period: {unpaidReceipt.billing_start} -{" "}
                {unpaidReceipt.billing_end}
              </p>
              <p>Amount Due: MWK {unpaidReceipt.amount_due.toLocaleString()}</p>
              <p>Status: {unpaidReceipt.status.toUpperCase()}</p>
            </div>
            <hr className="my-2 w-full border-dashed" />
            <p className="font-semibold text-gray-700">
              Total Due: MWK {unpaidReceipt.amount_due.toLocaleString()}
            </p>
            <p>Total Consumption: {unpaidReceipt.consumption} m³</p>
            <button
              onClick={handlePrintUnpaidReceipt}
              className={`${buttons.blue} mt-3 print:hidden`}
            >
              Receipt
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BillsPage;
