import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";
import "./AdminLogin.css";

function AdminLogin({ setUserRole }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Invalid credentials");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", "admin");

            setUserRole("admin");

            navigate("/admin");
        } catch (err) {
            console.error("Admin login error:", err);
            setError("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <div className="admin-login-box">
                <h2>Admin Login</h2>

                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <p className="admin-login-error">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;