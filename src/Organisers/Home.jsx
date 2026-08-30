import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../Components/ConfirmationModal';
import './Home.css';

function OrgHome() {
    const [ongoingEvents, setOngoingEvents] = useState([]);
    const [previousEvents, setPreviousEvents] = useState([]);
    const [regData, setRegData] = useState([]);
    const [showRegFor, setShowRegFor] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [onModalConfirm, setOnModalConfirm] = useState(() => () => {});

    const handleCloseClick = (event_id) => {
        setModalMessage("Close registrations for this event?");
        setOnModalConfirm(() => () => closeReg(event_id));
        setModalOpen(true);
    };

    const handleCancelClick = (event_id) => {
        setModalMessage("Cancel this event? This action cannot be undone. Notify your participants before cancelling.");
        setOnModalConfirm(() => () => cancelEvent(event_id));
        setModalOpen(true);
    };

    useEffect(() => {
        const fetchEvents = async () => {
            const userId = localStorage.getItem('userId');
            try {
                const res = await fetch(`http://localhost:3000/organizer/events?organizerId=${userId}`);
                const data = await res.json();
                setOngoingEvents(data.ongoing);
                setPreviousEvents(data.previous);
            } catch (err) {
                console.error("Failed to fetch events:", err);
            }
        };
        fetchEvents();
    }, []);

    const closeReg = async (event_id) => {
        try {
            const res = await fetch(`http://localhost:3000/organizer/close-registration/${event_id}`, {
                method: 'PUT',
            });
            const result = await res.json();
            if (result.success) {
                setOngoingEvents(prev =>
                    prev.filter(ev => ev.event_id !== event_id)
                );
                setPreviousEvents(prev => [...prev, ...ongoingEvents.filter(ev => ev.event_id === event_id)]);
            } else {
                console.error(result.message);
            }
        } catch (err) {
            console.error("Error closing registration:", err);
        }
    };

    const cancelEvent = async (event_id) => {
        try {
            const res = await fetch(`http://localhost:3000/organizer/delete-event/${event_id}`, {
                method: 'DELETE',
            });
            const result = await res.json();
            if (result.success) {
                setOngoingEvents(prev => prev.filter(ev => ev.event_id !== event_id));
                setPreviousEvents(prev => prev.filter(ev => ev.event_id !== event_id));
            } else {
                console.error(result.message);
            }
        } catch (err) {
            console.error("Error deleting event:", err);
        }
    };

    const fetchRegs = async (event_id, event_name) => {
        try {
            console.log('Fetching registrations for event:', event_id);
            const res = await fetch(`http://localhost:3000/organizer/registrations/${event_id}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setRegData(data);
            setShowRegFor({ id: event_id, name: event_name });
        } catch (err) {
            console.error('Error fetching registrations:', err);
            setRegData([]);
            setShowRegFor({ id: event_id, name: event_name });
        }
    };

    const parseCustomFields = (dataStr) => {
        try {
            const parsed = JSON.parse(dataStr);
            // Remove name & email (since they are already shown)
            const filtered = parsed.filter(field => field.name.toLowerCase() !== "name" && field.name.toLowerCase() !== "email");
            return filtered;
        } catch (err) {
            return [];
        }
    };

    return (
        <div className="org_home Main">
            <div className='home-head'>
                <h1 className="home-heading head-text">Welcome, Organizer!</h1>
                <p>"Effortlessly create and manage college events while attracting enthusiastic participants!"</p>
            </div>

            {/* Ongoing Events */}
            {ongoingEvents.length > 0 && (
                <div className='ong-events-home'>
                    <h2 className='sidehead head-text'>Your Ongoing Events</h2>
                    <hr className='subhead-divider' />
                    <div className='ongoing_events-home'>
                        {ongoingEvents.map(event => (
                            <div className='ongoing_event_cards' key={event.event_id}>
                                <div>
                                    <h1 className='head-text-card'>{event.title}</h1>
                                    <p id='cat'>{event.category}</p>
                                    <p id='datetime'>{event.time}<br />{new Date(event.date).toLocaleDateString()}</p>
                                    <p id='location'>{event.venue}</p>
                                    <p id='deadline'>Deadline: {new Date(event.reg_end_date).toLocaleString()}</p>
                                </div>
                                <div className='circle-prog'>
                                    <div className='box'>
                                        <div className='percent'>
                                            <svg>
                                                <circle cx="70" cy="70" r="70" />
                                                <circle cx="70" cy="70" r="70" style={{ strokeDashoffset: 440 - (440 * event.occupancy) / 100 }} />
                                            </svg>
                                            <div className='number'>
                                                <h2>{event.occupancy}<span>%</span></h2>
                                            </div>
                                        </div>
                                        <h3>Occupancy</h3>
                                    </div>
                                </div>
                                <div className='ongoing-btns'>
                                    <svg onClick={() => navigate(`/organizer/edit/${event.event_id}`)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M13.1739 3.5968C13.8662 3.2047 14.686 3.10369 15.4528 3.31598C15.7928 3.41011 16.0833 3.57409 16.3571 3.7593C16.6172 3.9352 16.9155 4.16808 17.2613 4.43799L17.3117 4.47737C17.6575 4.74728 17.9559 4.98016 18.1897 5.18977C18.4358 5.41046 18.6654 5.65248 18.8393 5.95945C19.2314 6.65177 19.3324 7.47151 19.1201 8.23831C19.026 8.5783 18.862 8.86883 18.6768 9.14267C18.5009 9.40276 18.268 9.70112 17.998 10.0469L10.8953 19.1462C10.8773 19.1692 10.8596 19.1919 10.8421 19.2144C10.5087 19.6419 10.2566 19.9651 9.9445 20.2306C9.68036 20.4553 9.38811 20.6447 9.07512 20.794C8.70535 20.9704 8.30733 21.0685 7.78084 21.1983C7.75324 21.2051 7.72528 21.212 7.69696 21.219L5.57214 21.7435C5.42499 21.7799 5.25702 21.8215 5.10885 21.8442C4.94367 21.8696 4.68789 21.8926 4.40539 21.8022C4.06579 21.6934 3.77603 21.4672 3.58809 21.1642C3.43175 20.9121 3.39197 20.6584 3.3765 20.492C3.36262 20.3427 3.36213 20.1697 3.3617 20.0181C3.36167 20.0087 3.36165 19.9994 3.36162 19.9902L3.35475 17.8295C3.35465 17.8003 3.35455 17.7715 3.35445 17.7431C3.3525 17.2009 3.35103 16.7909 3.4324 16.3894C3.50128 16.0495 3.61406 15.72 3.76791 15.4093C3.94967 15.0421 4.20204 14.7191 4.53586 14.2918C4.55336 14.2694 4.57109 14.2467 4.58905 14.2237L11.6918 5.12435C11.9617 4.77856 12.1946 4.48019 12.4042 4.2464C12.6249 4.00025 12.8669 3.77065 13.1739 3.5968ZM14.9191 5.24347C14.6635 5.17271 14.3903 5.20638 14.1595 5.33708C14.1203 5.35928 14.0459 5.41135 13.8934 5.5815C13.7348 5.75836 13.5438 6.00211 13.2487 6.38018L16.4018 8.84145C16.697 8.46338 16.887 8.21896 17.0201 8.02221C17.1482 7.83291 17.1806 7.74808 17.1926 7.70467C17.2634 7.44907 17.2297 7.17583 17.099 6.94505C17.0768 6.90586 17.0247 6.83145 16.8546 6.6789C16.6777 6.52033 16.434 6.32938 16.0559 6.03426C15.6778 5.73914 15.4334 5.54904 15.2367 5.41597C15.0474 5.28794 14.9625 5.25549 14.9191 5.24347ZM15.1712 10.418L12.0181 7.95674L6.16561 15.4543C5.75585 15.9792 5.6403 16.135 5.56031 16.2966C5.48339 16.452 5.42699 16.6167 5.39256 16.7866C5.35675 16.9633 5.35262 17.1572 5.35474 17.8231L5.36082 19.7357L7.2176 19.2773C7.86411 19.1177 8.05119 19.0666 8.21391 18.9889C8.37041 18.9143 8.51653 18.8196 8.64861 18.7072C8.78593 18.5904 8.90897 18.4405 9.31872 17.9156L15.1712 10.418ZM12 21C12 20.4477 12.4477 20 13 20H20C20.5523 20 21 20.4477 21 21C21 21.5523 20.5523 22 20 22H13C12.4477 22 12 21.5523 12 21Z" fill="#0F1729"></path> </g></svg>
                                    {event.approved == 1 ? (
                                        <button onClick={() => fetchRegs(event.event_id, event.title)}>Registrations</button>
                                    ) : event.approved == 2 ? (
                                        <button disabled style={{ backgroundColor: "#dc3545", color: "white" }}>Rejected</button>
                                    ) : (
                                        <button disabled style={{ backgroundColor: "#6c757d", color: "white" }}>Not Approved</button>
                                    )}
                                    <button onClick={() => handleCloseClick(event.event_id)}>Close Registrations</button>
                                    <button onClick={() => handleCancelClick(event.event_id)}>Cancel Event</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Previous Events */}
            {previousEvents.length > 0 && (
                <div className='ong-events-home'>
                    <h2 className='sidehead head-text'>Your Previous Events</h2>
                    <hr className='subhead-divider' />
                    <div className='previous-events'>
                        {previousEvents.map(event => (
                            <div className='previous_event_cards' key={event.event_id}>
                                <div className='col-flex'><>
                                    <h1 className='head-text-card-small'>{event.title}</h1>
                                    <p id='cat' style={{width: '150px'}}>{event.category}</p>
                                    </>
                                    <>
                                    <p id='datetime'>{event.time}<br />{new Date(event.date).toLocaleDateString()}</p>
                                    </>
                                    <>
                                    <p id='location'>{event.venue}</p>
                                    
                                    {event.approved == 1 ? (
                                        <button onClick={() => fetchRegs(event.event_id, event.title)}>Registrations</button>
                                    ) : event.approved == 2 ? (
                                        <button disabled style={{ backgroundColor: "#dc3545", color: "white" }}>Rejected</button>
                                    ) : (
                                        <button disabled style={{ backgroundColor: "#6c757d", color: "white" }}>Not Approved</button>
                                    )}
                                    </>
                                </div>
                                <div className='vertical-progress'>
                                    <p>Occupancy: {event.occupancy}%</p>
                                    <div className='vertical-bar'></div>
                                    <div className='vertical-bar-prog' style={{ height: `${event.occupancy}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Events */}
            {ongoingEvents.length === 0 && previousEvents.length === 0 && (
                <div className="no-events-msg">
                    <h2 className="subhead-text-card-v2">Host Your First Event</h2>
                    <p>You haven’t hosted any events yet. Let’s get started!</p>
                    <button className="host-event-btn" onClick={() => navigate('/organizer/host')}>Host an Event</button>
                </div>
            )}

            {/* Registration Table */}
            {showRegFor !== null && (
                <div className="reg-table-container">
                    <div className="reg-header">
                        <h3>Registrations for: {showRegFor.name || 'Unnamed Event'}</h3>
                        <button onClick={() => setShowRegFor(null)}>Close</button>
                    </div>
                    <table className="reg-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Registered At</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {regData.length === 0 ? (
                                <tr><td colSpan="5">No registrations</td></tr>
                            ) : (
                                regData.map((u) => {
                                    const customFields = parseCustomFields(u.data);
                                    const hasExtraFields = customFields.length > 0;

                                    return (
                                        <>
                                            <tr key={u.user_id}>
                                                <td>{u.user_id}</td>
                                                <td>{u.name}</td>
                                                <td>{u.email}</td>
                                                <td>{new Date(u.submitted_at).toLocaleString()}</td>
                                                <td>
                                                    {hasExtraFields && (
                                                        <button onClick={() => setExpandedRow(expandedRow === u.user_id ? null : u.user_id)}>
                                                            {expandedRow === u.user_id ? "Hide Details" : "More Details"}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>

                                            {expandedRow === u.user_id && hasExtraFields && (
                                                <tr className="details-row">
                                                    <td colSpan="5">
                                                        <div className="details-container">
                                                            <h4>Additional Details</h4>
                                                            <table className="custom-fields-table">
                                                                <tbody>
                                                                    {customFields.map((field, idx) => (
                                                                        <tr key={idx}>
                                                                            <td>{field.name}</td>
                                                                            <td>{field.value}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmationModal
                isOpen={modalOpen}
                message={modalMessage}
                onConfirm={() => {
                    onModalConfirm();
                    setModalOpen(false);
                }}
                onCancel={() => setModalOpen(false)}
            />
        </div>
    );
}

export default OrgHome;
