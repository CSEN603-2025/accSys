import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockUsers } from "../DummyData/mockUsers";

const LoginPage = ({ onLogin }) => {
    const [role, setRole] = useState("student");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        const user = mockUsers.find(
            (u) => u.username === username && u.password === password && u.role === role
        );
        if (user) {
            onLogin(user);
            navigate("/");
        } else {
            alert("Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white shadow-lg rounded-lg w-full max-w-md">
                <div className="text-center px-6 pt-8">
                    <h1 className="text-2xl font-bold text-blue-800">Sign In</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Access the internship management portal
                    </p>
                </div>
                <div className="px-6 mt-4">
                    <div className="flex justify-between mb-4 bg-gray-100 rounded">
                        {["student", "faculty", "company"].map((r) => (
                            <button
                                key={r}
                                className={`w-1/3 py-2 rounded ${role === r ? "bg-white shadow font-medium" : "text-gray-600"
                                    }`}
                                onClick={() => setRole(r)}
                            >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            type="text"
                            placeholder={`Enter ${role} username`}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="text-right text-sm mt-1">
                            <a href="#" className="text-blue-500">Forgot password?</a>
                        </div>
                    </div>
                    <button
                        className="w-full bg-blue-800 text-white py-2 rounded mt-2 hover:bg-blue-700"
                        onClick={handleLogin}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
