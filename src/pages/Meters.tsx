import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Modal from "../components/Modal";
import { useUser } from "../context/UserContext";
import Loader from "../components/Loader";

interface Meter {
  id: number;
  meter_no: string;
  customer_id: number;
  installed_at: string;
  status: string;
}

interface Customer {
  id: number;
  name: string;
  account_no: string;
  address: string;
  phone: string;
  email: string;
  meters: string[];
}

const Meters: React.FC = () => {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [filtered, setFiltered] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [formData, setFormData] = useState({
    meter_no: "",
    customer_id: "",
    installed_at: "",
    status: "active",
  });
  const [search, setSearch] = useState("");
  const { user } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // -------------------- Fetch Meters --------------------
  const fetchMeters = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      };
      const res = await axios.get("/meters/", config);
      setMeters(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeters();
  }, []);

  // -------------------- Debounced Customer Search --------------------
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await axios.get(`/customers/search?q=${searchQuery}`);
        setSearchResults(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // -------------------- Modal Actions --------------------
  const handleEdit = (meter: Meter) => {
    setSelectedMeter(meter);
    setFormData({
      meter_no: meter.meter_no,
      customer_id: meter.customer_id.toString(),
      installed_at: meter.installed_at,
      status: meter.status,
    });
    setIsModalOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        customer_id: parseInt(formData.customer_id, 10),
        installed_at: formData.installed_at,
        meter_no: formData.meter_no,
        status: formData.status,
      };
      if (selectedMeter) {
        await axios.put(`/meters/${selectedMeter.id}`, payload);
      } else {
        await axios.post("/meters/", payload);
      }
      fetchMeters();
      setIsModalOpen(false);
      setSelectedMeter(null);
      setFormData({
        meter_no: "",
        customer_id: "",
        installed_at: "",
        status: "active",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setFormData((prev) => ({
      ...prev,
      customer_id: customer.id.toString(),
    }));
    setSearchQuery(`${customer.name} (${customer.account_no})`);
    setShowDropdown(false);
  };

  // -------------------- Table Search --------------------
  const handleTableSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);

    const filteredMeters = meters.filter(
      (m) =>
        m.meter_no.toLowerCase().includes(value) ||
        m.customer_id.toString().includes(value) ||
        m.status.toLowerCase().includes(value)
    );

    setFiltered(filteredMeters);
  };

  return (
    <div className="p-0 overflow-x-auto flex-1">
      {/* --- Top Controls --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2">
        <input
          type="text"
          value={search}
          onChange={handleTableSearch}
          placeholder="Search by meter no, customer ID, or status..."
          className="w-full sm:w-1/3 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        />

        <button
          onClick={() => {
            setSelectedMeter(null);
            setFormData({
              meter_no: "",
              customer_id: "",
              installed_at: "",
              status: "active",
            });
            setIsModalOpen(true);
          }}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-1.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Add Meter
        </button>
      </div>

      {/* --- Table --- */}
      {loading ? (
        <Loader loading={loading} />
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-sm">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Meter No</th>
                <th className="px-6 py-3">Customer ID</th>
                <th className="px-6 py-3">Installed At</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((m) => (
                  <tr
                    key={m.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-3">{m.meter_no}</td>
                    <td className="px-6 py-3">{m.customer_id}</td>
                    <td className="px-6 py-3">{m.installed_at}</td>
                    <td>
                      <div className="flex items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full me-2 ${
                            m.status === "active"
                              ? "bg-green-500"
                              : m.status === "inactive"
                              ? "bg-red-500"
                              : "bg-gray-500"
                          }`}
                        ></div>
                        <span className="uppercase">{m.status}</span>
                      </div>
                    </td>

                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleEdit(m)}
                        className="text-blue-600 uppercase hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-400">
                    No meters found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Modal for Add/Edit --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMeter ? "Edit Meter" : "Add Meter"}
      >
        <form onSubmit={handleSubmit} className="relative">
          <div className="mb-4">
            <label className="block mb-1">Meter Number</label>
            <input
              type="text"
              name="meter_no"
              value={formData.meter_no}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* ✅ Dynamic Customer Search Field */}
          <div className="mb-4 relative">
            <label className="block mb-1">Customer</label>
            <input
              type="text"
              placeholder="Search by name, account no, or meter no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length && setShowDropdown(true)}
              className="w-full border p-2 rounded"
            />

            {showDropdown && (
              <div className="absolute z-10 w-full bg-white border rounded-lg shadow-md mt-1 max-h-48 overflow-y-auto">
                {searchLoading ? (
                  <p className="p-2 text-gray-500 text-sm">Searching...</p>
                ) : searchResults.length > 0 ? (
                  searchResults.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <span className="font-medium">{customer.name}</span>{" "}
                      <span className="text-gray-500 text-sm">
                        ({customer.account_no})
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="p-2 text-gray-500 text-sm">No results found</p>
                )}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1">Installed At</label>
            <input
              type="date"
              name="installed_at"
              value={formData.installed_at}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button className="bg-green-600 text-white px-6 py-3 rounded w-full">
            {selectedMeter ? "Update Meter" : "Add Meter"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Meters;
