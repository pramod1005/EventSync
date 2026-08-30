import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from './socket';
import './Chat.css';

function Chat({ role }) {
  const { eventId, organizerId, attendeeId: attendeeParam } = useParams();
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [eventName, setEventName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const initialSentRef = useRef(false);
  const chatRef = useRef(null);

  const attendeeId = role === "attendee" ? userId : attendeeParam;
  const organizerID = role === "organizer" ? userId : organizerId;

  // Scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }, 50);
    }
  }, [messages]);

  // Fetch chat rooms
  const fetchChatRooms = () => {
    if (!userId || !role) return;
    fetch(`http://localhost:3000/chat/rooms/${role}/${userId}`)
      .then(res => res.json())
      .then(data => setChatRooms(data))
      .catch(err => console.error("Error loading chat rooms:", err));
  };

  useEffect(() => {
    fetchChatRooms();

  }, [userId, role]);

  // Fetch event name
  useEffect(() => {
    if (!eventId) return;
    fetch(`http://localhost:3000/events/${eventId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.title) setEventName(data.title);
      })
      .catch(err => console.error("Error fetching event name:", err));
  }, [eventId]);

  // Setup socket and load messages
  useEffect(() => {
    if (!eventId || !attendeeId || !organizerID) return;

    const roomInfo = {
      event_id: eventId,
      attendee_id: attendeeId,
      organizer_id: organizerID,
    };

    socket.connect();
    socket.emit("joinRoom", roomInfo);
    socket.emit("getMessages", roomInfo);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      fetchChatRooms();
    });

    socket.on("loadMessages", (msgs) => {
      setMessages(msgs);
      setLoaded(true);
      fetchChatRooms();
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("loadMessages");
    };
  }, [eventId, attendeeId, organizerID]);

  useEffect(() => {
    if (loaded && messages.length > 0) {
      // Mark messages as seen for this chat
      const seenPayload = {
        event_id: eventId,
        receiver_id: userId,
        receiver_role: role,
        sender_id: role === "attendee" ? organizerID : attendeeId,
        sender_role: role === "attendee" ? "organizer" : "attendee"
      };

      fetch("http://localhost:3000/chat/mark-seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seenPayload)
      }).catch(err => console.error("Error marking messages as seen:", err));
    }
  }, [loaded, messages, eventId, role, userId, attendeeId, organizerID]);

  // Auto-send default message from attendee if no messages exist
  useEffect(() => {
    if (
      loaded &&
      messages.length === 0 &&
      role === "attendee" &&
      eventName &&
      !initialSentRef.current
    ) {
      const defaultMsg = {
        event_id: eventId,
        sender_id: attendeeId,
        sender_role: "attendee",
        receiver_id: organizerID,
        receiver_role: "organizer",
        message: `I have a query regarding event ${eventName}`,
      };
      socket.emit("sendMessage", defaultMsg);
      initialSentRef.current = true;
    }
  }, [loaded, messages.length, role, eventName, attendeeId, organizerID, eventId]);

  const sendMessage = () => {
    if (input.trim() === "") return;

    const msg = {
      event_id: eventId,
      sender_id: userId,
      sender_role: role,
      receiver_id: role === "attendee" ? organizerID : attendeeId,
      receiver_role: role === "attendee" ? "organizer" : "attendee",
      message: input,
    };

    socket.emit("sendMessage", msg);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };


  if (!eventId) {
    return (
      <div className="Main chatmain">
        <div className='chatlist'>
          <h2 id='inbox'>Inbox</h2>
          <hr />
          {chatRooms.length === 0 ? (
            <h3 style={{ padding: "0 20px" }}>No chats yet.</h3>
          ) : (
            chatRooms.map((room, idx) => {
              const otherUserName = role === "attendee" ? room.organizer_name : room.attendee_name;
              const chatUrl = role === "attendee"
                ? `/chat/attendees/${room.event_id}/${room.organizer_id}`
                : `/chat/organizers/${room.event_id}/${room.attendee_id}`;

              return (
                <div
                  className={`chatlist-item ${room.unread_count > 0 ? "unread" : ""
                    } ${chatUrl === activeChat ? "active" : ""}`}
                  key={idx}
                  onClick={() => {
                    setActiveChat(chatUrl);
                    navigate(chatUrl);
                  }}

                >
                  <h3>{room.event_title}</h3>
                  <p>{otherUserName}</p>
                  {room.unread_count > 0 && <span className="badge">{room.unread_count}</span>}
                </div>
              );
            })
          )}
        </div>
        <div className='chat-container'>
          <h3>Select a chat to view messages</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="Main chatmain">
      <div className='chatlist'>
        <h2 id='inbox'>Inbox</h2>
        <hr />
        {chatRooms.length === 0 ? (
          <h3 style={{ padding: "0 20px" }}>No chats yet.</h3>
        ) : (
          chatRooms.map((room, idx) => {
            const otherUserName = role === "attendee" ? room.organizer_name : room.attendee_name;
            const chatUrl = role === "attendee"
              ? `/chat/attendees/${room.event_id}/${room.organizer_id}`
              : `/chat/organizers/${room.event_id}/${room.attendee_id}`;

            return (
              <div
                className={`chatlist-item ${room.unread_count > 0 ? "unread" : ""
                  } ${chatUrl === activeChat ? "active" : ""}`}
                key={idx}
                onClick={() => {
                  setActiveChat(chatUrl);
                  navigate(chatUrl);
                }}

              >
                <h3>{room.event_title}</h3>
                <p>{otherUserName}</p>
                {room.unread_count > 0 && <span className="badge">{room.unread_count}</span>}
              </div>
            );
          })
        )}
      </div>

      <div className='chat-container'>
        <h3>{eventName || "Chat"}</h3>
        <div className="chat-messages" ref={chatRef}>
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.sender_id === userId && msg.sender_role === role;
              const displayName = isMe
                ? "You"
                : msg.sender_role === 'organizer'
                  ? `${msg.sender_name} (Organizer)`
                  : `${msg.sender_name} (Attendee)`;

              return (
                <div
                  key={i}
                  className={`chat-bubble ${isMe ? "outgoing" : "incoming"}`}
                >
                  <span className="chat-sender">{displayName}:</span>
                  <span className="chat-text">{msg.message}</span>
                </div>
              );
            })
          )}
        </div>
        <div className='chat-input'>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
