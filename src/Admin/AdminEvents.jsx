import { useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../Users/Regevent.css';
import ConfirmationModal from "../Components/ConfirmationModal";

function AdminEvents() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [regData, setRegData] = useState([]);
    const [showRegFor, setShowRegFor] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // 'approve' | 'reject' | null
    const navigate = useNavigate();

    const fetchEvent = () => {
        fetch(`http://localhost:3000/events/${eventId}`)
            .then(response => response.json())
            .then(data => {
                setEvent(data);
                setSelectedImageIndex(0);
            })
            .catch(error => console.error("Error fetching event:", error));
    };

    const updateEventStatus = (id, status) => {
        const endpoint = status === 1 ? 'approve' : 'reject';
        fetch(`http://localhost:3000/events/${id}/${endpoint}`, {
            method: 'PUT',
        })
            .then(res => res.json())
            .then(() => {
                fetchEvent(); // Refresh event details after update
            })
            .catch(err => console.error("Error updating event:", err));
    };

    const handleApprove = () => updateEventStatus(event.event_id, 1);
    const handleReject = () => updateEventStatus(event.event_id, 2);

    const fetchRegs = async (event_id) => {
        try {
            const res = await fetch(`http://localhost:3000/organizer/registrations/${event_id}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setRegData(data);
            setShowRegFor(true);
        } catch (err) {
            console.error('Error fetching registrations:', err);
            setRegData([]);
            setShowRegFor(true);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [eventId]);

    if (!event) return <p>Loading event details...</p>;

    const allImages = [event.cover_image, ...(event.pictures || [])];

    return (
        <div className="regevent Main">
            <div className="carousel-container">
                {allImages.length > 0 && (
                    <>
                        <div className='slider'>
                            <div className="testimonial-slide">
                                <img
                                    src={`/${allImages[selectedImageIndex]}`}
                                    alt={`Event ${selectedImageIndex}`}
                                    className="main-image"
                                />
                            </div>
                        </div>
                        <div className="thumbnail-container">
                            {allImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${selectedImageIndex === index ? "active" : ""}`}
                                    onClick={() => setSelectedImageIndex(index)}
                                >
                                    <img src={`/${img}`} alt={`Thumbnail ${index}`} />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className='event'>
                <h2 className='event_name'>{event.title || "Event Name"}</h2>
                <div className='event_info'>
                    <div className='event_reg'>
                        <div className='event_specs'>{event.categories?.join(", ") || "Category"}</div>
                        <div className='reg-btns'>
                            {event.approved === 1 ? (
                                <button
                                    className={`Register`}
                                    onClick={() => fetchRegs(event.event_id)}
                                >
                                    Registrations
                                </button>
                            ) : (
                                <>
                                    <button className="ApproveBtn" onClick={() => setConfirmAction('approve')}>Approve</button>
                                    <button className="RejectBtn" onClick={() => setConfirmAction('reject')}>Reject</button>
                                </>
                            )}
                        </div>
                    </div>
                    <hr />
                    <div className='event_details'>
                        <div className='event_date'>
                            {event.date ? new Date(event.date).toDateString() : "Date Not Available"} at {event.time || "Time Not Available"}
                        </div>
                        <div className='event_location'>
                            {/* location icon */}
                            <p>{event.venue || "Location Not Available"}</p>
                        </div>
                    </div>
                </div>

                <div className='event_info2'>
                    <div className='event_motto'>
                        <h3 className='motto_header'>What makes this event stand out from others?</h3>
                        <div className='motto'>
                            <div className='motto_info description-event'>
                                {event.description
                                    ? event.description.split('\n').map((para, i) => <p key={i}>{para}</p>)
                                    : <p>No description available for this event.</p>}

                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>

            {showRegFor && (
                <div className="reg-table-container">
                    <div className="reg-header">
                        <h3>Registrations for: {event.title || 'Unnamed Event'} </h3>
                        <button onClick={() => setShowRegFor(false)}>Close</button>
                    </div>
                    <table className="reg-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Date Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {regData.length === 0 ? (
                                <tr><td colSpan="4">No registrations</td></tr>
                            ) : (
                                regData.map(u => (
                                    <tr key={u.user_id}>
                                        <td>{u.user_id}</td>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>{new Date(u.date_joined).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!confirmAction}
                message={confirmAction === 'approve' ? 'Are you sure you want to approve this event?' : confirmAction === 'reject' ? 'Are you sure you want to reject this event?' : ''}
                onConfirm={() => {
                    if (confirmAction === 'approve') handleApprove();
                    if (confirmAction === 'reject') handleReject();
                    setConfirmAction(null);
                }}
                onCancel={() => setConfirmAction(null)}
            />
        </div>
    );
}

export default AdminEvents;
