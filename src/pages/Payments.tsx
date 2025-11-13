import React, { useState, useEffect } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { useUser } from "../context/UserContext";
import { buttons } from "../helper/helper";
import type { Bill, CustomerBillGroup } from "../types/billing";

interface ReceiptData {
  receipt_no: string;
  receipt_data: {
    customer: string;
    bill_id: number;
    amount_paid: number;
    method: string;
    cashier_id: number;
    datetime: string;
  };
}

const Payments: React.FC = () => {
  const [bills, setBills] = useState<CustomerBillGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBills, setFilteredBills] = useState<CustomerBillGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const [billId, setBillId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  // New states for selected bill info
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [billLoading, setBillLoading] = useState(false);

  const { user } = useUser();

  const fetchBills = async () => {
  try {
    setLoading(true);
    const config = {
      headers: { Authorization: `Bearer ${user?.token}` },
    };
    const res = await api.get("/billing/bills/", config);

    // Filter each group to include only PAID bills
    const paidGroups: CustomerBillGroup[] = res.data
      .map((group: CustomerBillGroup) => {
        const paidBills = group.bills.filter((bill) => bill.status === "paid");
        if (paidBills.length === 0) return null; // skip groups with no paid bills
        return {
          ...group,
          bills: paidBills,
          total_amount_due: paidBills.reduce((sum, bill) => sum + bill.amount_due, 0),
        };
      })
      .filter((group: any) => group !== null) as CustomerBillGroup[];

    setBills(paidGroups);
    setFilteredBills(paidGroups);
  } catch (err) {
    console.error("Error fetching bills:", err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchBills();
}, []);

  // Debounced search for paid bills (bottom table)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchQuery.trim()) {
        setFilteredBills(bills);
      } else {
        const lower = searchQuery.toLowerCase();
        const results = bills.filter(
          (b) =>
            b.customer.toLowerCase().includes(lower) ||
            b.customer_id.toFixed().includes(lower)
        );
        setFilteredBills(results);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, bills]);

  // Debounced Bill ID search (for payment form)
  useEffect(() => {
    if (!billId.trim()) {
      setSelectedBill(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setBillLoading(true);
        const config = {
          headers: { Authorization: `Bearer ${user?.token}` },
        };
        const res = await api.get(`/billing/bills/${billId}`, config);
        if (res.data && res.data.status !== "paid") {
          setSelectedBill(res.data);
          setAmount(res.data.amount_due);
        } else {
          setSelectedBill(null);
        }
      } catch (err) {
        setSelectedBill(null);
        console.error("Bill not found:", err);
      } finally {
        setBillLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [billId]);

  // Handle payment
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return alert("Please enter a valid unpaid Bill ID.");

    try {
      const username = user?.username;
      const payload = {
        bill_id: parseInt(billId, 10),
        amount,
        method,
        username,
      };
      console.log(payload);
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };
      const res = await api.post("/payments/", payload, config);
      setReceipt(res.data);
      fetchBills();
      setBillId("");
      setSelectedBill(null);
    } catch (err) {
      console.error("Payment failed:", err);
    }
  };

  // Print receipt
  const handlePrint = () => {
    if (!receipt) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Receipt ${receipt.receipt_no}</title></head>
          <body>
            <h2 style="text-align:center;">Payment Receipt</h2>
            <p><strong>Receipt No:</strong> ${receipt.receipt_no}</p>
            <p><strong>Customer:</strong> ${receipt.receipt_data.customer}</p>
            <p><strong>Bill ID:</strong> ${receipt.receipt_data.bill_id}</p>
            <p><strong>Amount Paid:</strong> ${
              receipt.receipt_data.amount_paid
            }</p>
            <p><strong>Method:</strong> ${receipt.receipt_data.method}</p>
            <p><strong>Date:</strong> ${new Date(
              receipt.receipt_data.datetime
            ).toLocaleString()}</p>
            <hr/>
            <p style="text-align:center;">Thank you for your payment!</p>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="overflow-x-auto">
      <h1 className="text-xl font-semibold mb-4">Record Payment</h1>

      {/* --- Payment Form --- */}
      <form
        onSubmit={handlePayment}
        className="flex flex-col sm:flex-row gap-2 mb-6"
      >
        <div className="flex flex-col flex-1">
          <input
            className="border p-2 rounded"
            placeholder="Bill ID"
            value={billId}
            onChange={(e) => setBillId(e.target.value)}
            required
          />
          {billLoading && (
            <span className="text-xs text-gray-500 mt-1">Searching...</span>
          )}
          {selectedBill ? (
            <div className="text-xs text-green-700 mt-1">
              <p>Customer: {selectedBill.customer}</p>
              <p>Amount Due: {selectedBill.amount_due.toFixed(2)}</p>
            </div>
          ) : (
            billId &&
            !billLoading && (
              <p className="text-xs text-red-600 mt-1">
                Bill not found or already paid.
              </p>
            )
          )}
        </div>

        <input
          className="border p-2 rounded flex-1"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select
          className="border p-2 rounded"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Mobile Money">Mobile Money</option>
        </select>
        <button
          className={
            "bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700"
          }
        >
          Pay
        </button>
      </form>

      {/* --- Receipt Display --- */}
      {receipt && (
        <div className="bg-white p-4 mb-6 rounded shadow w-full max-w-md">
          <h2 className="text-lg font-semibold mb-2">Receipt</h2>
          <p>
            <strong>Receipt No:</strong> {receipt.receipt_no}
          </p>
          <p>
            <strong>Customer:</strong> {receipt.receipt_data.customer}
          </p>
          <p>
            <strong>Amount Paid:</strong> {receipt.receipt_data.amount_paid}
          </p>
          <p>
            <strong>Method:</strong> {receipt.receipt_data.method}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(receipt.receipt_data.datetime).toLocaleString()}
          </p>
          <button
            onClick={handlePrint}
            className="mt-3 bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700"
          >
            🖨️ Print Receipt
          </button>
        </div>
      )}

      {/* --- Search and Paid Bills Table --- */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-lg">Paid Bills</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or bill no..."
          className="border p-2 rounded text-sm w-64"
        />
      </div>

      {loading ? (
        <Loader loading={loading} />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="bg-blue-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-4 py-2">Bill No</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length > 0 ? (
                filteredBills.map((b) =>
                  b.bills.map((bill) => (
                    <tr key={bill.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{bill.id}</td>
                      <td className="px-4 py-2">{bill.customer}</td>
                      <td className="px-4 py-2">
                        {bill.amount_due.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-green-600 font-semibold uppercase">
                        {bill.status}
                      </td>
                    </tr>
                  ))
                )
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-3 text-gray-400 italic"
                  >
                    No paid bills found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Payments;
