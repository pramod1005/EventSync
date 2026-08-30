import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Organisers/Home.jsx'
import Regevent from './Users/Regevent.jsx'
import OrgNav from "./Components/OrgNav.jsx";
import Host from "./Organisers/Host.jsx";
import Razerpay from "./Payments/Razerpay.jsx";
import Profile from "./Users/Profile.jsx";
import Admin from "./Admin/Admin.jsx";
import AdminNavbar from "./Components/AdminNavbar.jsx";
import Admin_Org from "./Admin/Admin_Org.jsx";
import Admin_User from "./Admin/Admin_User.jsx";
import Orgprofile from "./Organisers/Orgprofile.jsx"
import BrowseOrg from "./Users/BrowseOrg.jsx";
function App2() {
    return (
        <BrowserRouter>
        </BrowserRouter>
    )
}

export default App2;