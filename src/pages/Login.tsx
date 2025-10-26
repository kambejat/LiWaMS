import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useUser } from "../context/UserContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { username, password });

      const userData = {
        token: res.data.access_token,
        username: res.data.username,
        role: res.data.role,
      };

      // Save to localStorage
      localStorage.setItem("token", userData.token);
      localStorage.setItem("username", userData.username);
      localStorage.setItem("role", userData.role);
      

      // Update global user context
      setUser(userData);

      navigate("/dashboard/home");
    } catch (err) {
      setError("Invalid username or password");
    }
  };


  return (
    <div className="flex items-center justify-center h-screen bg-blue-50">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg p-6 rounded-xl w-96"
      >
        <h1 className="text-xl font-semibold mb-4 text-center">
          Water Billing System
        </h1>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-3 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
