import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './BrowseOrg.css';

function BrowseOrg() {
    const { org_id } = useParams();

    const [org, setOrg] = useState(null);
    const [upcoming, setUpcoming] = useState([]);
    const [previous, setPrevious] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3000/api/organiser/${org_id}`)
            .then(res => {
                if (!res.ok) throw new Error(`status ${res.status}`);
                return res.json();
            })
            .then(data => {
                setOrg(data.organiser);
                setUpcoming(data.ongoingEvents);
                setPrevious(data.previousEvents);
            })
            .catch(err => console.error('❌ fetch failed:', err));
    }, [org_id]);

    if (!org) return <div>Loading...</div>;

    return (
        <div className='browse_org'>
            <div className='browse_org_main'>
                <div className='browse_org_logo'>
                    <img src={org.logo ? `/${org.logo.replace(/\\/g, '/')}` : '/placeholder.jpg'} alt="Logo" />
                </div>
                <div className='browse_org_info'>
                        <h1 className='home-heading head-text'>{org.name}</h1>
                    <hr className='subhead-divider'/>
                    <div className='browse_org_description'>
                        {org.description || 'No description available.'}
                    </div>
                </div>
            </div>

            <div className='browse_org_events'>
                {/* Upcoming Events */}
                <div className='discover-browseorg'>
                    <div className='row-flex'>
                        <h1 className='sidehead head-text'>Upcoming Events</h1>
                    </div>
                    <hr className='subhead-divider' />

                    <div className="event-cardholder">
                        {upcoming.length > 0 ? (
                            
                            upcoming.map((e) => {const imgPath = e.cover_image?.replace(/\\/g, '/');
                                return (
                                
                                <div className="content" key={e.event_id}>
                                    <div className="contentimg">
                                        <img src={`/${imgPath}`}/>
                                    </div>
                                    <h2 className="contenth1">{e.title}</h2>
                                    <h5 className='content-date'>ㅤ</h5>
                                    <Link to={`/register/${e.event_id}`} className='contenta'>
                                        <button className='discover-details'>Details</button>
                                    </Link>
                                </div>
                            )})
                        ) : (
                            <p>No approved events found.</p>
                        )}
                    </div>
                </div>
                {/* Previous Events */}
                <div className='discover-browseorg'>
                    <div className='row-flex'>
                        <h1 className='sidehead head-text'>Previous Events</h1>
                    </div>
                    <hr className='subhead-divider' />

                    <div className="event-cardholder">
                        {previous.length > 0 ? (
                            
                            previous.map((e) => {const imgPath = e.cover_image?.replace(/\\/g, '/');
                                return (
                                
                                <div className="content" key={e.event_id}>
                                    <div className="contentimg">
                                        <img src={`/${imgPath}`}/>
                                    </div>
                                    <h2 className="contenth1">{e.title}</h2>
                                    <h5 className='content-date'>ㅤ</h5>
                                    <Link to={`/register/${e.event_id}`} className='contenta'>
                                        <button className='discover-details'>Details</button>
                                    </Link>
                                </div>
                            )})
                        ) : (
                            <p>No approved events found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BrowseOrg;
