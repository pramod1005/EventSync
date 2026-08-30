import './AdminNavbar.css';
import { Link, useNavigate } from "react-router-dom";

function AdminNavbar({ setUserRole }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");

        setUserRole("");
        navigate("/admin");
    };

    return (
        <nav className="admin-navbar">
            <div className="admin-navbar-left">
                <div className="admin-logo">
                    EventSync
                </div>

                <Link to="/admin" className="admin-nav-link">
                    Events
                </Link>

                <Link to="/admin/user" className="admin-nav-link">
                    Users
                </Link>

                <Link to="/admin/organizer" className="admin-nav-link">
                    Organizers
                </Link>
            </div>

            <button
                className="admin-logout-btn"
                onClick={handleLogout}
            >
                Logout
            </button>
        </nav>
    );
}

export default AdminNavbar;