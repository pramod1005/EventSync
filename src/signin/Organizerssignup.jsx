import { useState } from "react";
import "./loginsignup.css";
import API_URL from "../config";


function Organizerssignup() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [signupPending, setSignupPending] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setMessage("");
        setOtpError("");
        setSignupPending(true);
        try {
            // Send OTP to username (assuming username is email)
            const res = await fetch(`${API_URL}/attendee/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: username }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send OTP");
            setOtpModalOpen(true);
        } catch (error) {
            setMessage(error.message || "Failed to send OTP");
        }
        setSignupPending(false);
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setOtpError("");
        try {
            // Verify OTP
            const res = await fetch(`${API_URL}/attendee/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: username, otp }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Invalid OTP");
            // Proceed with signup
            const signupRes = await fetch(`${API_URL}/organizer/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, username, password }),
            });
            const signupData = await signupRes.json();
            if (!signupRes.ok) throw new Error(signupData.error);
            setMessage("Signup successful! Redirecting to login...");
            setOtpModalOpen(false);
            setTimeout(() => {
                window.location.href = "/organizer/signin";
            }, 2000);
        } catch (error) {
            setOtpError(error.message || "OTP verification failed");
        }
    };

    return (
        <div className="loginsignup body1">
            <div className="loginsignupinfo">
                <h2 className="loginsignuph2 head-text">WELCOME TO PLANOVA</h2>
                <p>"Your seamless event planning platform"</p>
            </div>

            <div className="loginsignupinput">
                <div className="wrapper">
                    <div className="title"><span>Organizers Signup</span></div>

                    <form onSubmit={handleSignup}>
                        <div className="row">
                            <i className="fas fa-user"></i>
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="row">
                            <i className="fas fa-envelope"></i>
                            <input
                                type="email"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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

                        <div className="row button">
                            <input type="submit" value={signupPending ? "Sending OTP..." : "Signup"} disabled={signupPending} />
                        </div>
                    </form>

                    {message && <p className="message">{message}</p>}
                </div>
            </div>

            {otpModalOpen && (
                <div className="otp-modal">
                    <div className="otp-modal-content">
                        <h3>Email Verification</h3>
                        <p>Enter the OTP sent to your email:</p>
                        <form onSubmit={handleOtpSubmit}>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                                required
                                className="otp-input"
                            />
                            <button type="submit">Verify OTP</button>
                        </form>
                        {otpError && <p className="error-message">{otpError}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Organizerssignup;
