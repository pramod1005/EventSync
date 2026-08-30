import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Organizers.css';

function Organizers() {
    const [organizers, setOrganizers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3000/api/organizers')
            .then(res => {
                if (!res.ok) throw new Error(`Status ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log("✅ fetched organizers:", data);
                setOrganizers(data);
            })
            .catch(err => console.error("❌ Error fetching organizers:", err));
    }, []);

    const handleClick = (org_id) => {
        console.log("🛠 org_id passed to navigate:", org_id);
        navigate(`/browse-organizer/${org_id}`);
    };


    return (
        <div className='organizers_browse Main' >
            <div className='home-head'>
                <h1 className="home-heading head-text">Discover Event Organizers</h1>
                <p>"Connect with the teams behind your favorite events."</p>
            </div>
            <div className='discover-orgs'>
                        <h1 className='sidehead head-text'>Organizers</h1>
                    
                    <hr className='subhead-divider' />

            <div className='Org'>
                {organizers.map((org, index) => {
                    console.log("org:", org);
                    return (
                        <div
                            key={org.organiser_id || org.id || index}
                            className='Event'
                            onClick={() => handleClick(org.organiser_id || org.id)}
                        >
                            <img src={org.logo?.replace(/\\/g, '/')} alt={org.name} />
                            <h3>{org.name}</h3>
                        </div>
                    );
                })}

            </div>
        </div>


        </div>
    );
}

export default Organizers;
