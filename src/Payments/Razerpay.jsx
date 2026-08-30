import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import './Razerpay.css';

function Razerpay() {
    const location = useLocation();
    const { eventId, amount, customFields } = location.state || {};
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [formData, setFormData] = useState({});
    const [orderId, setOrderId] = useState("");
    const [getNotified, setGetNotified] = useState(false);


    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => console.log("Razorpay SDK Loaded");
        document.body.appendChild(script);

        // Fetch user info
        const fetchUserData = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) return;

            try {
                const res = await fetch(`http://localhost:3000/attendee/${userId}`);
                const data = await res.json();
                setFormData((prev) => ({
                    ...prev,
                    Name: data.name || "",
                    Email: data.email || ""
                }));
            } catch (err) {
                console.error("Failed to fetch user info:", err);
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const createOrder = async () => {
    if (!customFields.every(field => formData[field.name])) {
        alert("Please fill all required fields.");
        return;
    }

    if (amount === 0) {
        try {
            await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": localStorage.getItem("userId")
                },
                body: JSON.stringify({
                    event_id: eventId,
                    form_data: formData,
                    notify: getNotified ? 1 : 0,
                    razorpay_payment_id: 'free'
                })
            });

            setRegistrationSuccess(true);
            setTimeout(() => {
                window.location.href = `/register/${eventId}`;
            }, 3000);
        } catch (err) {
            console.error("Error registering for free event:", err);
        }

        return;
    }

    try {
        const res = await fetch("http://localhost:3000/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }) // Amount in paise
        });

        const data = await res.json();
        setOrderId(data.id);
        openRazorpay(data.id);
    } catch (err) {
        console.error("Error creating order:", err);
    }
};


    const openRazorpay = (orderId) => {
        if (!window.Razorpay) {
            alert("Razorpay SDK failed to load. Try again.");
            return;
        }

        const options = {
            key: "rzp_test_TU4MFan1t7TmPE", // Replace with your Razorpay key
            amount: amount,
            currency: "INR",
            name: "Planova",
            description: "Event Registration",
            order_id: orderId,
            handler: async (response) => {
                alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            
                await fetch("http://localhost:3000/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-user-id": localStorage.getItem("userId")
                    },
                    body: JSON.stringify({
                        event_id: eventId,
                        form_data: formData,
                        notify: getNotified ? 1 : 0,
                        razorpay_payment_id: response.razorpay_payment_id
                    })
                });
            
                setRegistrationSuccess(true);
            
                // ⏳ Redirect after 3 seconds
                setTimeout(() => {
                    window.location.href = `/register/${eventId}`;
                }, 3000);
            },
            
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };
    if (registrationSuccess) {
        return (
            <div className="paymentmain">
                <h2>🎉 Registration Successful!</h2>
                <p>You will be redirected shortly...</p>
            </div>
        );
    }
    
    return (
        <div className="paymentmain">
            <h2>Event Registration</h2>

            <form className="form">
                <table className="fillform-table">
                    <tbody>
                        {customFields && customFields.map((field, index) => (
                            <tr key={index}>
                                <td>
                                    <label htmlFor={field.name}>{field.name}:</label>
                                </td>
                                <td>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        id={field.name}
                                        value={formData[field.name] || ""}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </form>

            <div className="switch">
                <p>Get notified about this event:</p>
                <input
                    type="checkbox"
                    name="toggle1"
                    id="toggle1"
                    checked={getNotified}
                    onChange={() => setGetNotified(!getNotified)}
                />
                <label htmlFor="toggle1"></label>
            </div>

            <button onClick={createOrder} className="generatebutton">
                Continue To Pay ₹{amount / 100}
            </button>
        </div>
    );
}

export default Razerpay;
