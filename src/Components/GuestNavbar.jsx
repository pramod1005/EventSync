import './Navbar.css'
import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from 'react';

function GuestNavbar() {
    const [unreadCount, setUnreadCount] = useState(0);
    const role = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    useEffect(() => {
        if (!userId || !role) {
            console.log("Missing userId or role");
            return;
        }

        const fetchUnread = async () => {
            try {
                console.log("Fetching unread count...");
                const res = await fetch(`http://localhost:3000/chat/unread-count?user_id=${userId}&role=${role}`);
                const data = await res.json();
                console.log("Unread from backend:", data.unread);
                setUnreadCount(data.unread || 0);
            } catch (err) {
                console.error("Error fetching unread count", err);
            }
        };

        fetchUnread();

        const interval = setInterval(fetchUnread, 10000);
        return () => clearInterval(interval);
    }, [userId, role]);


    return (
        <div className="navbar">
            <h2 className='title'>Planova</h2>
            <div className='nb-button-guest'>
                <Link to="/"><button className='btn'>Home</button></Link>
                <Link to="/browse"><button className='btn'>Browse</button></Link>
                {!userId && (
                    <Link to="/signin">
                        <button className="btn btn-signin">Sign In</button>
                    </Link>
                )}

            </div>



            <Outlet />
        </div>
    )
}

export default GuestNavbar; 
