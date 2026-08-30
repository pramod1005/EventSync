import { useNavigate } from 'react-router-dom'; 
import './signin.css';

function Signin() {
    const navigate = useNavigate(); 

    const handleSigninRedirect = (role) => {
        if (role === 'attendee') {
            navigate('/attendee/signin'); 
        } else if (role === 'organizer') {
            navigate('/organizer/signin'); 
        }
    };

    return (
        <div className='signin'>
            <div className='signininfo'>
                <h2 className='signinh2 head-text'>
                    Get Started Today
                </h2>
                <p>"Be a part of an interactive and efficient platform designed to make event planning and participation effortless. Whether you’re an attendee or an organizer, our system ensures a smooth experience with seamless connectivity."</p>
            </div>
            <div className='usersignin'>
                <div className='attendees'>
                    <h3 className='usersignh3'>Attendees</h3>
                    <ul>
                        <li><h4>Explore a variety of events:</h4> Discover workshops, conferences, and meetups based on your interests.</li>
                        <li><h4>Easy registration process:</h4> Sign up quickly with a seamless online registration system.</li>
                        <li><h4>Receive event updates:</h4> Get timely notifications and updates.</li>
                    </ul>
                    <button className="signinbut" onClick={() => handleSigninRedirect('attendee')}>
                        Sign In as an Attendee
                    </button>
                </div>

                <div style={{
                    width: "2px",
                    height: "100%",
                    backgroundColor: "black",
                    margin: "0 10px"
                }}></div>

                <div className='organizers'>
                    <h3 className='usersignh3'>Organizers</h3>
                    <ul>
                        <li><h4>Register for events easily:</h4> Quick and simple online registration with confirmation emails.</li>
                        <li><h4>Receive event notifications:</h4> Stay updated with real-time alerts via email, SMS, or push notifications.</li>
                        <li><h4>Connect with organizers:</h4> Engage with event hosts via chat, discussion forums, or social media.</li>
                    </ul>
                    <button className="signinbut" onClick={() => handleSigninRedirect('organizer')}>
                        Sign In as an Organizer
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Signin;
