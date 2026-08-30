import { useEffect, useState } from 'react';
import './Email.css';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid Date";

  const day = date.getDate();
  const suffix = (d => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  })(day);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day}${suffix} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
}

function formatTime(timeStr) {
  const [hourStr, minuteStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr.padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}


const templates = [
    {
        title: 'Event Reminder',
        subject: 'Reminder: [Event Title] is almost here!',
        body: `Hello Everyone,

This is a friendly reminder about our upcoming event: [Event Title] on [Event Date] at [Event Time], happening at [Event Venue].

We look forward to your participation!

Warm regards,  
[Organiser Name]`
    },
    {
  title: 'Event Cancellation Notice',
  subject: '[Event Title] has been Cancelled',
  body: `Dear Participants,

We regret to inform you that [Event Title], originally scheduled for [Event Date] at [Event Time] in [Event Venue], has been cancelled due to unforeseen circumstances.

We sincerely apologize for any inconvenience this may cause and appreciate your understanding.

If you have any questions, feel free to contact us.

Best regards,  
[Organiser Name]`
},
    {
        title: 'Event Day Details',
        subject: 'Details for Today’s Event: [Event Title]',
        body: `Hello Everyone,

Today is the day! [Event Title] is happening at [Event Venue], starting at [Event Time].

Please arrive 10–15 minutes early to check in. Can’t wait to see you all!

Cheers,  
[Organiser Name]`
    },
    {
        title: 'Post-Event Thank You',
        subject: 'Thank You for Attending [Event Title]!',
        body: `Hello Everyone,

Thank you for being a part of [Event Title]! We hope you enjoyed the experience and found it meaningful.

We truly appreciate your participation and support.

Stay tuned for future events.  
Until next time!

Warm regards,  
[Organiser Name]`
    },
    {
        title: 'Important Update Regarding',
        subject: 'Update: [Event Title]',
        body: `Hi Everyone,

We’d like to share an important update regarding [Event Title], scheduled on [Event Date].

[Add update here, e.g., change in venue or timing.]

We apologize for any inconvenience and appreciate your understanding.

Regards,  
[Organiser Name]`
    }
];

function Email() {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [status, setStatus] = useState('');
    const [eventDetails, setEventDetails] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [sending, setSending] = useState(false);

    const organiserId = localStorage.getItem("userId"); // Adjust if different

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(`http://localhost:3000/organiser/${organiserId}/events`);
                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Invalid JSON response");
                }

                const data = await res.json();
                setEvents(data);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchEvents();
    }, [organiserId]);

    useEffect(() => {
        if (selectedEvent) {
            fetchEventDetails(selectedEvent);
        }
    }, [selectedEvent]);

    const fetchEventDetails = async (eventId) => {
        try {
            const res = await fetch(`http://localhost:3000/events/${eventId}`);
            const data = await res.json();
            setEventDetails(data);
        } catch (error) {
            console.error("Error fetching event details:", error);
        }
    };

    const autofillTemplate = (template) => {
        if (!eventDetails) return;

        const filledSubject = template.subject
            .replace(/\[Event Title\]/g, eventDetails.title || '')
            .replace(/\[Organiser Name\]/g, '[Organiser Name]'); // Replace with actual name later

        const filledBody = template.body
            .replace(/\[Event Title\]/g, eventDetails.title || '')
            .replace(/\[Event Date\]/g, formatDate(eventDetails.date))
            .replace(/\[Event Time\]/g, formatTime(eventDetails.time))
            .replace(/\[Event Venue\]/g, eventDetails.venue || '')
            .replace(/\[Organiser Name\]/g, '[Organiser Name]');

        setSubject(filledSubject);
        setBody(filledBody);
    };

    const sendEmail = async () => {
        if (!selectedEvent || !subject || !body) {
            setShowModal(false);
            return alert("Please fill all fields.");
        }
        setSending(true);
        setStatus('Sending...');
        try {
            const res = await fetch('http://localhost:3000/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: selectedEvent, subject, body })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('✅ Email sent successfully!');
                setSubject('');
                setBody('');
            } else {
                setStatus(`❌ Failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            setStatus(`❌ Failed: ${error.message}`);
        }
        setSending(false);
        setShowModal(false);
        setTimeout(() => setStatus(''), 4000);
    };

    return (
        <div className="email-main Main">
            <div className="email-container">
                {/* Modal for confirmation and sending */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            {!sending ? (
                                <>
                                    <h3>Confirm Send Notification</h3>
                                    <p>Are you sure you want to send this notification to all attendees?</p>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <button className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button className="modal-confirm" onClick={sendEmail}>Confirm</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3>Sending...</h3>
                                    <p>Please wait while your notification is being sent.</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {status && (
                    <div className="email-popup">
                        <p>{status}</p>
                    </div>
                )}

                <div className="email-input">
                    <div className="email-text">
                        {/* Event Dropdown */}
                        <h2 className='sidehead head-text'>Notify your Attendees</h2>
                        <hr className='subhead-divider'/>
                        <div className="form-group">
                            <select
                                value={selectedEvent}
                                onChange={(e) => setSelectedEvent(e.target.value)}
                                className="email-dropdown"
                            >
                                <option value=""> Select an Event </option>
                                {events.map(event => (
                                    <option key={event.event_id} value={event.event_id}>
                                        {event.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subject */}
                        <div className="form-group">
                            <input
                                type="text"
                                className="email-subject"
                                placeholder="Enter subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>

                        {/* Body */}
                        <div className="form-group">
                            <textarea
                                rows="5"
                                placeholder="Write your message here..."
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                        </div>

                        {/* Send Button */}
                        <div className="form-group" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="send-button" onClick={() => setShowModal(true)} disabled={sending}>
                                Send Notification
                            </button>
                        </div>
                    </div>

                    <div className="email-templates">
                        <h2 className='sidehead head-text'>Templates</h2>
                        <hr className='subhead-divider'/>
                        <div className="template-buttons">
                            {templates.map((t, i) => (
                                <button key={i} onClick={() => autofillTemplate(t)}>
                                    {t.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="to-container" style={{ textAlign: 'center', margin: '20px' }}>
                    <i>This email will be sent to all the attendees who opted for notifications.</i>
                </p>

                {status && <p className="status-msg">{status}</p>}
            </div>
        </div>
    );
}

export default Email;
