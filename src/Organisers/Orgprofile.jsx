import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";
import "./Orgprofile.css";

function OrgConfirmationModal({ isOpen, onConfirm, onCancel, message }) {
    if (!isOpen) return null;

    return (
        <div className="modal-backdropOrg">
            <div className="modal-contentOrg">
                <p>{message}</p>
                <div className="modal-buttonsOrg">
                    <button onClick={onCancel} className="cancel-btn">No</button>
                    <button onClick={onConfirm} className="confirm-btn">Yes</button>
                </div>
            </div>
        </div>
    );
}

function Orgprofile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState([]);
    const [ongoingEvents, setOngoingEvents] = useState([]);
    const [previousEvents, setPreviousEvents] = useState([]);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [showImageInput, setShowImageInput] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const organiserId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                console.log("Fetching profile for organiser ID:", organiserId);
                const res = await fetch(`http://localhost:3000/api/organiser/${organiserId}`);
                if (!res.ok) {
                    throw new Error(`HTTP error ${res.status}`);
                }
                const data = await res.json();
                console.log("Data received:", data);
                setProfile(data.organiser);
                setOngoingEvents(data.ongoingEvents);
                setPreviousEvents(data.previousEvents);
            } catch (err) {
                console.error("Error fetching organiser profile:", err);
            }
        };

        if (organiserId && userRole === "organizer") {
            fetchProfile();
        }
    }, [organiserId, userRole]);


    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
        window.location.reload();
    };

    const handleEditClick = () => {
        setEditName(profile?.name || "");
        setEditDescription(profile?.Description || "");
        setShowEditModal(true);
    };

    const handleEditConfirm = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/organiserp/${organiserId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName, description: editDescription }) // send lowercase 'description'
            });
            if (!res.ok) throw new Error("Failed to update profile");
            setProfile(prev => ({ ...prev, name: editName, Description: editDescription })); // update capital 'Description' in state
            setShowEditModal(false);
        } catch (err) {
            alert("Error updating profile");
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("logo", file);
        try {
            const res = await fetch(`http://localhost:3000/api/organiserp/${organiserId}/logo`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.success && data.logo) {
                setProfile(prev => ({ ...prev, logo: `/${data.logo}` }));
                window.location.reload();
            } else {
                alert("Image upload failed");
            }
        } catch (err) {
            alert("Error uploading image");
        }
        setUploadingImage(false);
        setShowImageInput(false);
    };

    return (
        <div className="Organizers_profile">
            <div className="OrgProfile_boxM1">
                <div className="Orgprofile_logo">
                    <img src={profile?.logo || "/profile_pic2.jpg"} alt="Profile" />
                    <button className="profile_change_img_btn" onClick={() => setShowImageInput(true)} disabled={uploadingImage} style={{ marginTop: "5px" }}>
                        {uploadingImage ? "Uploading..." : "Change Image"}
                    </button>
                    {showImageInput && (
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginTop: "10px" }} />
                    )}
                    <p className="Orgname">Hey {profile?.name || "Organizer"}</p>
                    <p className="Role">Organizer</p>
                    <button className="Orgprofilelogout" onClick={() => setShowLogoutModal(true)}>Log Out</button>
                </div>
            </div>

            <div className="OrgProfile_boxM2">
                <div className="Profile_box_1">
                    <div className="profile_box1_name"><span>Name: </span>{profile?.name}</div>
                    <div className="profile_box1_name"><span>Email: </span>{profile?.username}</div>
                    <div className="profile_box1_name"><span>Description: <br /></span>{profile?.Description || "No Description"}</div>
                    <button className="profile_edit_btn" onClick={handleEditClick}>Edit</button>
                </div>

                <div className="Profile_box_2">
                    <p>Ongoing Events</p>
                    <div className="Ongoing_Organised_events">
                        {ongoingEvents.length > 0 ? (
                            ongoingEvents.map((event, index) => (
                                <div
                                    key={index}
                                    className="Ongoing_event1"
                                    style={{ cursor: "pointer" }}
                                >
                                    {event.title}
                                </div>
                            ))
                        ) : (
                            <div className="Ongoing_event1">No ongoing events.</div>
                        )}
                    </div>
                </div>

                <div className="Profile_box_3">
                    <p>Completed Events</p>
                    <div className="Prev_Organised_events">
                        {previousEvents.length > 0 ? (
                            previousEvents.map((event, index) => (
                                <div
                                    key={index}
                                    className="Pre_event1"
                                    style={{ cursor: "pointer" }}
                                >
                                    {event.title}
                                </div>
                            ))
                        ) : (
                            <div className="Pre_event1">No completed events yet.</div>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={showLogoutModal}
                message="Are you sure you want to log out?"
                onCancel={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />
            <OrgConfirmationModal className="Edit_Profile_Box"
                isOpen={showEditModal}
                message={
                    <div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>Name:</label>
                            <input style={{ backgroundColour: "white" }} type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                        </div>
                        <div>
                            <label>Description:</label>
                            <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={4} />
                        </div>
                    </div>
                }
                onCancel={() => setShowEditModal(false)}
                onConfirm={handleEditConfirm}
            />
        </div>
    );
}

export default Orgprofile;