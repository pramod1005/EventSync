import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';
import './Home.css';

function Home() {
    const [events, setEvents] = useState([]);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [confirmAction, setConfirmAction] = useState(() => () => { });

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        fetch("http://localhost:3000/events/recent")
            .then((res) => res.json())
            .then((data) => setEvents(data))
            .catch((err) => console.error("Error fetching events:", err));
    }, []);

    useEffect(() => {
        if (!userId) return;
        fetch(`http://localhost:3000/registrations/user/${userId}`)
            .then(res => res.json())
            .then(data => setRegisteredEvents(data))
            .catch(err => console.error("Error fetching registered events:", err));
    }, [userId]);

    const handleToggleNotification = (regEvent) => {
        setSelectedEvent(regEvent);
        setConfirmAction(() => () => {
            fetch("http://localhost:3000/notifications/toggle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    registration_id: regEvent.registration_id,
                    enable: !regEvent.notify
                })
            })
                .then(res => res.json())
                .then(() => {
                    // Optimistically update UI
                    setRegisteredEvents(prev =>
                        prev.map(e =>
                            e.registration_id === regEvent.registration_id
                                ? { ...e, notify: !e.notify }
                                : e
                        )
                    );
                })
                .catch(err => console.error("Toggle failed:", err))
                .finally(() => setModalOpen(false));
        });
        setModalOpen(true);
    };

    return (
        <div className="home Main">
            <div className='home-head'>
                <h1 className="home-heading head-text">Hey, Attendee!</h1>
                <p>"Your college experience is what you make it. Let's get started."</p>
            </div>
            <div className='home-flex'>
                {/* Discover Section */}
                <div className='discover-home'>
                    <div className='row-flex'>
                        <h1 className='sidehead head-text'>Discover Events</h1>
                        <Link to="/browse"><button className='subhead-btn'>View All</button></Link>
                    </div>
                    <hr className='subhead-divider' />

                    <div className="event-cardholder">
                        {events.length > 0 ? (
                            events.slice(0, 6).map((event) => (
                                <div className="content" key={event.event_id}>
                                    <div className="contentimg">
                                        <img
                                            src={event.cover_image || "https://via.placeholder.com/300"}
                                            alt={event.title}
                                        />
                                    </div>
                                    <h2 className="contenth1">{event.title}</h2>
                                    <h5 className='content-date'>{event.date}</h5>
                                    <Link to={`/register/${event.event_id}`} className='contenta'>
                                        <button className='discover-details'>Details</button>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p>No approved events found.</p>
                        )}
                    </div>
                </div>

                {/* Registered Events Section */}
                <div className='home-personal-reg'>
                    <h1 className='sidehead head-text'>Registered Events</h1>
                    <hr className='subhead-divider' />
                    {registeredEvents.length === 0 ? (
                        <p style={{ padding: "10px" }}>You haven't registered for any events.</p>
                    ) : (
                        registeredEvents.map(event => (
                            <div className='reg-notify-tile' key={event.registration_id}>
                                <div>
                                    <img src={event.cover_image} />
                                    <div>
                                        <h2 className='notifyh1'>{event.title}</h2>
                                        <h5 className='content-date'>{event.date || 'Date TBD'}</h5>
                                    </div>
                                </div>
                                <img
                                    src={event.notify ? '/subscribed.svg' : '/unsubscribed.svg'}
                                    alt="Notify toggle"
                                    onClick={() => handleToggleNotification(event)}
                                    style={{ cursor: "pointer", width: "24px", height: "24px" }}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={modalOpen}
                message={`Are you sure you want to ${selectedEvent?.notify ? "disable" : "enable"} notifications for "${selectedEvent?.title}"?`}
                onConfirm={confirmAction}
                onCancel={() => setModalOpen(false)}
            />
        </div>
    );
}

export default Home;
