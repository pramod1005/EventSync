import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';


import Admin from './Admin/Admin.jsx';
import Admin_User from './Admin/Admin_User.jsx';
import Admin_Org from './Admin/Admin_Org.jsx';
import Home from './Users/Home.jsx';
import Guesthome from './Users/Guesthome.jsx';
import Browse from './Users/Browse.jsx';
import Regevent from './Users/Regevent.jsx';
import Chat from './communication/Chat.jsx';
import Organizers from './Users/Organizers.jsx';
import Orgprofile from './Organisers/Orgprofile.jsx';
import EditEvent from './Organisers/EditEvent.jsx';
import Attendeessignin from './signin/attendeessignin.jsx';
import Attendeessignup from './signin/Attendeessignup.jsx';
import Organizerssignin from './signin/Organizerssignin.jsx';
import Organizerssignup from './signin/Organizerssignup.jsx';
import Signin from './signin/signin.jsx';
import Profile from './Users/Profile.jsx';
import Razerpay from './Payments/Razerpay.jsx';
import AdminEvents from './Admin/AdminEvents.jsx';
import Guestregevent from './Users/Guestregevent.jsx';

import BrowseOrg from './Users/BrowseOrg.jsx';
import OrgHome from './Organisers/Home.jsx';
import Host from './Organisers/Host.jsx';
import Email from './Organisers/Email.jsx';

import Navbar from './Components/Navbar.jsx';
import GuestNavbar from './Components/GuestNavbar.jsx';
import OrgNav from './Components/OrgNav.jsx';
import AdminNavbar from './Components/AdminNavbar';

import AdminLogin from './Admin/AdminLogin.jsx';

function AppRoutes({ userRole, setUserRole }) {
  const location = useLocation();
  return (
    <>
      {userRole === 'admin' && location.pathname.startsWith('/admin') 
        ? <AdminNavbar setUserRole={setUserRole} />
        : userRole === 'organizer'
        ? <OrgNav />
        : userRole === 'attendee'
        ? <Navbar />
        : <GuestNavbar />
      }
      <Routes>
        {/* Landing route */}
        <Route
          path="/"
          element={
            !userRole ? <Guesthome /> :
              userRole === 'attendee' ? <Home /> :
              userRole === 'organizer' ? <Navigate to="/organizer/home" /> :
              userRole === 'admin' ? <Navigate to="/admin" /> :
              <Guesthome />
          }
        />

        {/* Signin route for guest view buttons */}
        <Route path="/signin" element={<Signin />} />

        {/* Public route for viewing event details */}
        <Route path="/register/:eventId" element={<Regevent />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/guestregevent/:eventId" element={<Guestregevent />} />
        {userRole === 'attendee' && (
          <>


            <Route path="/profile" element={<Profile />} />
            <Route path="/register/:eventId/fillform" element={<Razerpay />} />
            <Route path="/organizers" element={<Organizers />} />
            <Route path="/browse-organizer/:org_id" element={<BrowseOrg />} />
            <Route path="/chat" element={<Chat role="attendee" />} />
            <Route path="/chat/attendees/:eventId/:organizerId" element={<Chat role="attendee" />} />
          </>
        )}

        {userRole === 'organizer' && (
          <>
            <Route path="/organizer/home" element={<OrgHome />} />
            <Route path="/organizer/host" element={<Host />} />
            <Route path="/organizer/notify" element={<Email />} />
            <Route path="/chat" element={<Chat role="organizer" />} />
            <Route path="/chat/organizers/:eventId/:attendeeId" element={<Chat role="organizer" />} />
            <Route path="/orgprofile" element={<Orgprofile />} />
            <Route path="/organizer/edit/:id" element={<EditEvent />} />
          </>
        )}

        {/* Auth Routes */}
        <Route path="/attendee/signin" element={!userRole ? <Attendeessignin setUserRole={setUserRole} /> : <Navigate to="/" />} />
        <Route path="/attendee/signup" element={!userRole ? <Attendeessignup setUserRole={setUserRole} /> : <Navigate to="/" />} />
        <Route path="/organizer/signin" element={!userRole ? <Organizerssignin setUserRole={setUserRole} /> : <Navigate to="/organizer/home" />} />
        <Route path="/organizer/signup" element={!userRole ? <Organizerssignup setUserRole={setUserRole} /> : <Navigate to="/organizer/home" />} />

        {/* Admin and fallback */}
        <Route
          path="/admin"
          element={
            userRole === "admin"
              ? <Admin />
              : <AdminLogin setUserRole={setUserRole} />
          }
        />

        <Route
          path="/admin/user"
          element={
            userRole === "admin"
              ? <Admin_User />
              : <Navigate to="/admin" />
          }
        />

        <Route
          path="/admin/organizer"
          element={
            userRole === "admin"
              ? <Admin_Org />
              : <Navigate to="/admin" />
          }
        />

        <Route
          path="/admin/events/:eventId"
          element={
            userRole === "admin"
              ? <AdminEvents />
              : <Navigate to="/admin" />
          }
        />
      </Routes>
    </>
  );
}

function App() {
  const [userRole, setUserRole] = useState((localStorage.getItem('userRole') || "").toLowerCase());

  useEffect(() => {
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem('userRole'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes userRole={userRole} setUserRole={setUserRole} />
    </BrowserRouter>
  );
}

export default App;