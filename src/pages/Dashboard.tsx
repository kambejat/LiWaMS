import { useUser } from "../context/UserContext";
import { Outlet } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../api/axios";
import Sidebar from "../components/Sidebar";
import HeaderSection from "../components/HeaderSection";

interface Customer {
  id: number;
  account_no: number;
  name: string;
  phone: string;
  email: string;
  balance: number;
}

const Dashboard = () => {
  const { user, logout } = useUser();
  const [query, setQuery] = useState("");
  const [debouncedValue, setDebouncedValue] = useState(query);
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const delay = 1000; // ms

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(query);
    }, delay);
    // console.log(query)

    return () => {
      clearTimeout(handler);
    };
  }, [query, delay]);

  // Search customers when debounced value changes
  useEffect(() => {
    if (!debouncedValue.trim()) {
      setResults([]);
      return;
    }

    const fetchSearch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/customers/search?q=${debouncedValue}`);

        const data: any = Array.isArray(res.data) ? res.data : [];
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]); // fallback to empty
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
  }, [debouncedValue]);

  return (
    <div
      className={`flex h-screen bg-gray-800 ${
        isOpen ? "overflow-hidden" : "overflow-auto"
      }`}
    >
      <Sidebar role={user?.role} isOpen={isOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-y-auto">
        <header className="z-40 py-4 bg-gray-800">
          <div className="flex items-center justify-between h-8 px-6 mx-auto">
            {/* Mobile hamburger */}
            <button
              className={`p-1 mr-5 -ml-1 rounded-md md:hidden focus:outline-none focus:shadow-outline-purple ${
                isOpen ? "hidden" : "block"
              }`}
              aria-label="Menu"
              onClick={toggleSidebar}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </button>

            {/* Search Input */}
            <div className="flex justify-center mt-2 mr-4">
              <div className="relative flex w-full flex-wrap items-stretch mb-3">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="form-input px-3 py-2 placeholder-gray-400 text-gray-700 relative bg-white rounded-lg text-sm shadow outline-none focus:outline-none focus:shadow-outline w-full pr-10"
                />
                <span className="z-10 h-full leading-snug font-normal text-center text-gray-400 absolute bg-transparent rounded text-base items-center justify-center w-8 right-0 pr-3 py-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 -mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
              </div>
            </div>

            {/* Notification + Profile Menus */}
            <ul className="flex items-center flex-shrink-0 space-x-6">
              {/* Notifications Menu */}
              <li className="relative">
                <button
                  className="p-2 bg-white text-green-400 align-middle rounded-full hover:text-white hover:bg-green-400 focus:outline-none"
                  aria-label="Notifications"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span className="absolute top-0 right-0 inline-block w-3 h-3 transform translate-x-1 -translate-y-1 bg-red-600 border-2 border-white rounded-full"></span>
                </button>

                {showNotifications && (
                  <ul className="absolute right-0 w-56 p-2 mt-2 space-y-2 text-gray-700 bg-white border border-gray-200 rounded-md shadow-lg">
                    <li className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer">
                      <span>Messages</span>
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded-full">
                        13
                      </span>
                    </li>
                    <li className="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer">
                      Bill update available
                    </li>
                    <li className="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer">
                      Payment received
                    </li>
                  </ul>
                )}
              </li>

              {/* Profile Menu */}
              <li className="relative">
                <button
                  className="p-2 bg-white text-green-400 align-middle rounded-full hover:text-white hover:bg-green-400 focus:outline-none"
                  aria-label="Account"
                  onClick={() => setShowProfile(!showProfile)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>

                {showProfile && (
                  <ul className="absolute right-0 w-48 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                    <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                      <a href="#" className="flex items-center text-gray-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Profile
                      </a>
                    </li>
                    <li
                      className="px-3 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"
                      onClick={() => logout()}
                    >
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </div>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>
        </header>

        <main>
          <div className="grid mb-4 pb-10 px-8 mx-4 rounded-lg bg-gray-100 border-2 border-green-400">
            <HeaderSection />

            <AnimatePresence>
              {loading && (
                <motion.div
                  key="spinner"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center mt-4"
                >
                  {/* SVG Spinner */}
                  <svg
                    className="animate-spin h-8 w-8 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Results OR Default Dashboard Content */}
            {!loading && (
              <>
                {query && results.length > 0 ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative p-4 bg-white overflow-x-auto shadow-md sm:rounded-lg"
                  >
                    <h3 className="text-md font-semibold mb-3">
                      Search Results
                    </h3>
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">Account No</th>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Phone</th>
                          <th className="px-6 py-3">Meter(s)</th>
                          <th className="px-6 py-3">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((c, index) => (
                          <motion.tr
                            key={c.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="px-6 py-3">{c.account_no}</td>
                            <td className="px-6 py-3">{c.name}</td>
                            <td className="px-6 py-3">{c.phone || "—"}</td>
                            <td className="px-6 py-3">
                              {c.meters && c.meters.length > 0
                                ? c.meters.join(", ")
                                : "—"}
                            </td>
                            <td className="px-6 py-3">
                              MWK {c.balance ? c.balance.toFixed(2) : "0.00"}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                ) : query && results.length === 0 ? (
                  <motion.p
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center text-gray-500 mt-6"
                  >
                    No results found.
                  </motion.p>
                ) : (
                  <Outlet /> // Default dashboard content
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
export default Dashboard