import { Link, useNavigate } from 'react-router-dom';
import Footer from '../Components/Footer';
import { useEffect, useState } from 'react';
import './GuestHome.css';

function Guesthome() {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3000/events/recent")
            .then((res) => res.json())
            .then((data) => setEvents(data))
            .catch((err) => console.error("Error fetching events:", err));
    }, []);

    const handleSignin = () => {
        navigate('/signin');
    };

    return (
        <div className="guesthome main">
            <div className="guesthome-head">
                <h1 className="guesthome-heading guesthead-text">College Events made easy!</h1>
                <p className="guesthome-subtext">Explore a variety of college events and easily register to participate in the ones that excite you the most!</p>
                <button className="guestsignin" onClick={handleSignin}>Sign In</button>
            </div>

           <div className='discover-ghome'>
                    <div className='row-flex'>
                        <h1 className='sidehead head-text'>Discover Events</h1>
                        <Link to="/browse"><button className='subhead-btn'>View All</button></Link>
                    </div>
                    <hr className='subhead-divider' />

                    <div className="event-cardholder">
                        {events.length > 0 ? (
                            events.map((event) => (
                                <div className="content" key={event.event_id}>
                                    <div className="contentimg">
                                        <img
                                            src={event.cover_image || "https://via.placeholder.com/300"}
                                            alt={event.title}
                                        />
                                    </div>
                                    <h2 className="contenth1">{event.title}</h2>
                                    <h5 className='content-date'>{event.date}</h5>
                                    <Link to={`/guestregevent/${event.event_id}`} className='contenta'>
                                        <button className='discover-details'>Details</button>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p>No approved events found.</p>
                        )}
                    </div>
                </div>
            <Footer />
        </div>
    );
}

export default Guesthome;
