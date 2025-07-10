import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Create axios instance with base URL
    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        timeout: 10000, // 10 second timeout
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        try {
            const res = await api.post("/admin/login", {
                email: email.trim(),
                password,
            });

            const { token, user } = res.data;

            // Store token and user info
            localStorage.setItem("adminToken", token);
            if (user) {
                localStorage.setItem("adminUser", JSON.stringify(user));
            }

            setMessage("Login successful!");
            console.log("Admin Login Success:", { token, user });

            // Small delay to show success message
            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);

        } catch (err) {
            console.error("Login failed:", err);

            // Better error handling
            let errorMessage = "Login failed";

            if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
                errorMessage = "Cannot connect to server. Please check if the server is running.";
            } else if (err.response?.status === 401) {
                errorMessage = "Invalid email or password";
            } else if (err.response?.status === 429) {
                errorMessage = "Too many login attempts. Please try again later.";
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center mb-4">Admin Login</h2>

                {message && (
                    <div
                        className={`alert ${message.includes("successful") ? "alert-success" : "alert-danger"}`}
                        role="alert"
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Email address
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-dark w-100"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Logging in...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;