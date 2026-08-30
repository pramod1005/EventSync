import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./loginsignin.css";
import API_URL from "../config";

function Attendeessignin({ setUserRole }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [otpError, setOtpError] = useState("");
    const [forgotPending, setForgotPending] = useState(false);
    const navigate = useNavigate(); 

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${API_URL}/attendee/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", "attendee");
            localStorage.setItem("userId", data.user_id);

            setUserRole("attendee");
            setMessage("Login successful!");

            navigate("/");
            window.location.reload();
        } catch (error) {
            setMessage(error.message || "Login failed");
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setOtpError("");
        setMessage("");
        if (!email) {
            setMessage("Please enter your email first.");
            return;
        }
        setForgotPending(true);
        try {
            // Check if email exists and send OTP
            const res = await fetch(`${API_URL}/attendee/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send OTP");
            setOtpModalOpen(true);
        } catch (error) {
            setMessage(error.message || "Failed to send OTP");
        }
        setForgotPending(false);
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setOtpError("");
        if (!newPassword) {
            setOtpError("Please enter a new password.");
            return;
        }
        try {
            // Verify OTP and update password
            const res = await fetch(`${API_URL}/attendee/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword })
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Invalid OTP or password reset failed");
            setOtpModalOpen(false);
            setMessage("Password reset successful! You can now login.");
        } catch (error) {
            setOtpError(error.message || "OTP verification failed");
        }
    };

    return (
        <div className="loginsignin body1">
            <div className="loginsignininfo">
                <h2 className="loginsigninh2 head-text">WELCOME TO PLANOVA</h2>
                <p>"Your seamless event planning platform"</p>
            </div>

            <div className="loginsignininput">
                <div className="wrapper">
                    <div className="title"><span>Attendees Sign-in</span></div>

                    <form onSubmit={handleLogin}>
                        <div className="row">
                            <i className="fas fa-envelope"></i>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="row">
                            <i className="fas fa-lock"></i>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="pass">
                            <a href="#" onClick={handleForgotPassword} style={{ color: forgotPending ? '#aaa' : '' }}>
                                {forgotPending ? "Sending OTP..." : "Forgot password?"}
                            </a>
                        </div>

                        <div className="row button">
                            <input type="submit" value="Login" />
                        </div>

                        <div className="signin-link">Not a member? <a href="/attendee/signup">Signup now</a></div>
                    </form>

                    {message && <p className="message">{message}</p>}
                </div>
            </div>

            {otpModalOpen && (
                <div className="otp-modal">
                    <div className="otp-modal-content">
                        <h3>Reset Password</h3>
                        <p>Enter the OTP sent to your email and your new password:</p>
                        <form onSubmit={handleOtpSubmit}>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                                required
                                className="otp-input"
                            />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="New Password"
                                required
                                className="otp-input"
                                style={{ marginTop: 8 }}
                            />
                            <button type="submit">Reset Password</button>
                        </form>
                        {otpError && <p className="error-message">{otpError}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Attendeessignin;
