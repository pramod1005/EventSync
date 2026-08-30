import { useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './Regevent.css';
import Footer from '../Components/Footer';
import ConfirmationModal from "../Components/ConfirmationModal";

function Guestregevent() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [recentEvents, setRecentEvents] = useState([]);
    const [isRegistered, setIsRegistered] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const navigate = useNavigate();

    const userId = localStorage.getItem('userId');

    useEffect(() => {

        fetch(`http://localhost:3000/events/${eventId}`)
            .then(response => response.json())
            .then(data => {
                setEvent(data);
                setSelectedImageIndex(0);
            })
            .catch(error => console.error("Error fetching event:", error));

        // Fetch recent events
        fetch("http://localhost:3000/events/recent")
            .then(response => response.json())
            .then(data => {
                setRecentEvents(data);
            })
            .catch(error => console.error("Error fetching recent events:", error));

        // Check if user is already registered
        if (userId) {
            fetch(`http://localhost:3000/registrations/check?eventId=${eventId}&userId=${userId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.registered) {
                        setIsRegistered(true);
                    }
                })
                .catch(err => console.error("Error checking registration:", err));
        }

    }, [eventId, userId]);

    const handleSupportClick = () => {
        setShowSupportModal(true);
    };
    const handleSupportConfirm = () => {
        setShowSupportModal(false);
        navigate(`/chat/attendees/${eventId}/${event.organiser}`);
    };
    const handleSupportCancel = () => {
        setShowSupportModal(false);
    };

    if (!event) return <p>Loading event details...</p>;
    const now = new Date();
    const regClosed = event.reg_end_date && new Date(event.reg_end_date) < now;

    const allImages = [event.cover_image, ...(event.pictures || [])];

    return (
        <div className="regevent Main">
            <div className="carousel-container">
                {allImages.length > 0 && (
                    <>
                        <div className='slider'>
                            <div className="testimonial-slide">
                                <img
                                    src={`../${allImages[selectedImageIndex]}`}
                                    alt={`Event ${selectedImageIndex}`}
                                    className="main-image"
                                />
                            </div>
                        </div>
                        <div className="thumbnail-container">
                            {allImages.map((img, index) => (
                                <div
                                    key={img || index}
                                    className={`thumbnail ${selectedImageIndex === index ? "active" : ""}`}

                                    onClick={() => setSelectedImageIndex(index)}
                                >
                                    <img src={`../${img}`} alt={`Thumbnail ${index}`} />
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

                            <button
                                className={`Register`}
                                onClick={() =>
                                    navigate(`/signin`)
                                }
                            >
                                Register
                            </button>
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
                    <div className='uc_event'>
                        <h3 className='uc_event_header'>More Events</h3>
                        <div className='events'>
                            {recentEvents
                                .filter(e => e.event_id !== parseInt(eventId)).slice(0,4)
                                .map((e) => (
                                    <Link to={`/guestregevent/${e.event_id}`} key={e.event_id} className='UC_event'>
                                        <div className='event1'>
                                            <img className='event_photo' src={`../${e.cover_image}`} alt={e.title} />
                                            <div className='artist_name'>{e.title}</div>
                                        </div>
                                    </Link>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={showSupportModal}
                message="Do you want to proceed to chat with support?"
                onCancel={handleSupportCancel}
                onConfirm={handleSupportConfirm}
            />
            <Footer></Footer>
        </div>
    );
}

export default Guestregevent;
