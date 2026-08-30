import React, { useEffect, useState } from 'react';
import './Admin.css';
import AdminNavbar from '../Components/AdminNavbar';
import { useNavigate } from 'react-router-dom';



function Admin() {
    const [pendingEvents, setPendingEvents] = useState([]);
    const [ongoingEvents, setOngoingEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = () => {
        fetch('http://localhost:3000/admin/events')
            .then(res => res.json())
            .then(data => {
                setPendingEvents(data.pending);
                setOngoingEvents(data.ongoing);
            })
            .catch(err => console.error("Error fetching events:", err));
    };

    const updateEventStatus = (id, status) => {
        const endpoint = status === 1 ? 'approve' : 'reject';
        fetch(`http://localhost:3000/events/${id}/${endpoint}`, {
            method: 'PUT',
        })
            .then(res => res.json())
            .then(() => {
                fetchEvents(); // Refresh event list after update
            })
            .catch(err => console.error("Error updating event:", err));
    };

    const handleViewDetails = (event_id) => {
        navigate(`/register/${event_id}`); // ✅ navigate to event page
    };

    return (
        <div className='admin Main'>
            <AdminNavbar />

            {/* Pending Events Section */}
            <div className='events_tobeapproved'>
                <div className='events_approval_header'><h2>Events to be approved</h2></div>
                                <hr />

                <div className='event_cards'>
                    {pendingEvents.map((event, idx) => (
                        <div className='event_card1' key={idx}>
                            <div className='event_card1_name'>{event.title}</div>
                            <div className='event_card1_Orgname'>{event.organiser_name}</div>
                            <div className='event_card1_date'>
                                {new Date(event.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>

                            <button className='event_btns_vd' onClick={() => navigate(`/admin/events/${event.event_id}`)}>View Details</button>
                            <button
                                className='event_btns_rej'
                                onClick={() => updateEventStatus(event.event_id, 2)}
                            >
                                Reject
                            </button>
                            <button
                                className='event_btns_app'
                                onClick={() => updateEventStatus(event.event_id, 1)}
                            >
                                Approve
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ongoing Events Section */}
            <div className='events_ongoing'>
                <div className='events_ongoing_header'><h2>Ongoing Events</h2></div>
                                <div className='Card_headers'>
                    <div className='card1_Eventname'>Event</div>
                        <div className='card1_Organame'>Organizer</div>
                        <div className='card1_date'>Date of Event</div>
                </div>
                <div className='event_cards'>
                    {ongoingEvents.map((event) => (
                        <div className='event_card1' key={event.event_id}>
                            <div className='event_card1_name'>{event.title}</div>
                            <div className='event_card1_Orgname'>{event.organiser_name}</div>
                            <div className='event_card1_date'>
                                {new Date(event.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                            
                            <button className='event_btns_vd' onClick={() => navigate(`/admin/events/${event.event_id}`)}>View Details</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Admin;
