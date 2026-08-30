import { useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './Regevent.css';
import ConfirmationModal from "../Components/ConfirmationModal";

function Regevent() {
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
                            <Link to={`/chat/attendees/${eventId}/${event.organiser}`}>
                                <button id='support' onClick={handleSupportClick}>
                                    <svg width="35px" height="42px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>support</title> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> <g id="support" fill="#000000" transform="translate(42.666667, 42.666667)"> <path d="M379.734355,174.506667 C373.121022,106.666667 333.014355,-2.13162821e-14 209.067688,-2.13162821e-14 C85.1210217,-2.13162821e-14 45.014355,106.666667 38.4010217,174.506667 C15.2012632,183.311569 -0.101643453,205.585799 0.000508304259,230.4 L0.000508304259,260.266667 C0.000508304259,293.256475 26.7445463,320 59.734355,320 C92.7241638,320 119.467688,293.256475 119.467688,260.266667 L119.467688,230.4 C119.360431,206.121456 104.619564,184.304973 82.134355,175.146667 C86.4010217,135.893333 107.307688,42.6666667 209.067688,42.6666667 C310.827688,42.6666667 331.521022,135.893333 335.787688,175.146667 C313.347976,184.324806 298.68156,206.155851 298.667688,230.4 L298.667688,260.266667 C298.760356,283.199651 311.928618,304.070103 332.587688,314.026667 C323.627688,330.88 300.801022,353.706667 244.694355,360.533333 C233.478863,343.50282 211.780225,336.789048 192.906491,344.509658 C174.032757,352.230268 163.260418,372.226826 167.196286,392.235189 C171.132153,412.243552 188.675885,426.666667 209.067688,426.666667 C225.181549,426.577424 239.870491,417.417465 247.041022,402.986667 C338.561022,392.533333 367.787688,345.386667 376.961022,317.653333 C401.778455,309.61433 418.468885,286.351502 418.134355,260.266667 L418.134355,230.4 C418.23702,205.585799 402.934114,183.311569 379.734355,174.506667 Z M76.8010217,260.266667 C76.8010217,269.692326 69.1600148,277.333333 59.734355,277.333333 C50.3086953,277.333333 42.6676884,269.692326 42.6676884,260.266667 L42.6676884,230.4 C42.6676884,224.302667 45.9205765,218.668499 51.2010216,215.619833 C56.4814667,212.571166 62.9872434,212.571166 68.2676885,215.619833 C73.5481336,218.668499 76.8010217,224.302667 76.8010217,230.4 L76.8010217,260.266667 Z M341.334355,230.4 C341.334355,220.97434 348.975362,213.333333 358.401022,213.333333 C367.826681,213.333333 375.467688,220.97434 375.467688,230.4 L375.467688,260.266667 C375.467688,269.692326 367.826681,277.333333 358.401022,277.333333 C348.975362,277.333333 341.334355,269.692326 341.334355,260.266667 L341.334355,230.4 Z"> </path> </g> </g> </g></svg>
                                </button>
                            </Link>

                            <button
                                className={`Register ${isRegistered || regClosed ? 'disabled' : ''}`}
                                disabled={isRegistered || regClosed}
                                onClick={() =>
                                    !isRegistered && !regClosed &&
                                    navigate(`/register/${event.event_id}/fillform`, {
                                        state: {
                                            eventId: event.event_id,
                                            amount: event.price * 100,
                                            customFields: event.custom_fields || [
                                                { name: "Name", type: "text" },
                                                { name: "Email", type: "email" },
                                                { name: "Phone", type: "tel" }
                                            ]
                                        }
                                    })
                                }
                            >
                                {regClosed ? "Closed" : isRegistered ? "Registered" : "Register now"}
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
                                .filter(e => e.event_id !== parseInt(eventId)).slice(0,6)
                                .map((e) => (
                                    <Link to={`/register/${e.event_id}`} key={e.event_id} className='UC_event'>
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
        </div>
    );
}

export default Regevent;
