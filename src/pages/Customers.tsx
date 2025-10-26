import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";
import Loader from "../components/Loader";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customers/");
      setCustomers(res.data);
      setFiltered(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = { ...form, email: form.email || "info@infor.mw" };
    await api.post("/customers/", payload);
    setForm({ name: "", address: "", phone: "", email: "" });
    setIsOpen(false);
    fetchCustomers();
  };

  // Handle search input
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);

    const results = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(value) ||
        c.phone?.toLowerCase().includes(value) ||
        c.account_no?.toLowerCase().includes(value)
    );

    setFiltered(results);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="overflow-x-auto">
      {/* --- Search and Add Button --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-2">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by name, phone, or account no..."
          className="w-full sm:w-1/3 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        />

        <button
          onClick={() => setIsOpen(true)}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Add Customer
        </button>
      </div>

      {/* --- Add Customer Modal --- */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Customer">
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
          <div className="mb-2">
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Name
            </label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
              placeholder="Customer full name..."
              required
            />
          </div>

          <div className="mb-2">
            <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Address
            </label>
            <input
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
              placeholder="Customer address..."
              required
            />
          </div>

          <div className="mb-2">
            <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Phone
            </label>
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
              placeholder="Customer phone number..."
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
              placeholder="Email (optional)..."
            />
          </div>

          <button className="text-white inline-flex w-full justify-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
            Add
          </button>
        </form>
      </Modal>

      {/* --- Table or Loader --- */}
      {loading ? (
        <Loader loading={loading} />
      ) : (
        <div className="relative p-4 bg-white overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-blue-50">
              <tr>
                <th className="px-6 py-3">Account No</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Balance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{c.account_no}</td>
                    <td className="px-6 py-3">{c.name}</td>
                    <td className="px-6 py-3">{c.phone || "—"}</td>
                    <td className="px-6 py-3">{c.email || "info@infor.mw"}</td>
                    <td className="px-6 py-3">{c.balance?.toFixed(2) || "0.00"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-400">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
