import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Payments from "./pages/Payments";
import Receipts from "./pages/Receipts";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Meters from "./pages/Meters";
import BillsPage from "./pages/BillsPage";
import UserManagement from "./pages/Users";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
          <Route path="home" element={<Home />} />
          <Route path="customers" element={<Customers />} />
          <Route path="payments" element={<Payments />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="meters" element={<Meters />} />          
          <Route path="bills" element={<BillsPage /> } />
          <Route path="users" element={<UserManagement />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
