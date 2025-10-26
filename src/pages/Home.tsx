import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [summary, setSummary] = useState<any>(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, chartRes] = await Promise.all([
          axios.get("http://localhost:5000/api/dashboard/summary"),
          axios.get("http://localhost:5000/api/dashboard/monthly"),
        ]);
        setSummary(summaryRes.data);
        setChartData(chartRes.data);
      } catch (error) {
        console.error("Dashboard data error:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 shadow rounded">
            <h4 className="text-gray-600 text-sm">Total Customers</h4>
            <p className="text-2xl font-bold text-blue-700">
              {summary.total_customers}
            </p>
          </div>
          <div className="bg-white p-4 shadow rounded">
            <h4 className="text-gray-600 text-sm">Total Paid</h4>
            <p className="text-2xl font-bold text-green-600">
              MWK {summary.total_paid.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 shadow rounded">
            <h4 className="text-gray-600 text-sm">Total Unpaid</h4>
            <p className="text-2xl font-bold text-red-600">
              MWK {summary.total_unpaid.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 shadow rounded">
            <h4 className="text-gray-600 text-sm">Total Payments</h4>
            <p className="text-2xl font-bold text-blue-500">
              {summary.total_payments}
            </p>
          </div>
        </div>
      )}

      {/* Monthly Chart */}
      <div className="bg-white p-6 shadow rounded">
        <h3 className="text-lg font-semibold mb-4">
          Monthly Payments vs Unpaid
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="paid" fill="#3b82f6" name="Paid" />
            <Bar dataKey="unpaid" fill="#ef4444" name="Unpaid" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
