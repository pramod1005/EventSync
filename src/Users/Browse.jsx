import './Browse.css'
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import ChatIcon from '../Components/ChatIcon';
import { useNavigate } from 'react-router-dom';
import API_URL from "../config";


function Browse() {
    const navigate = useNavigate();
    const [selectedStartDate, setSelectedStartDate] = useState('');
    const [selectedEndDate, setSelectedEndDate] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [eventMode, setEventMode] = useState('ongoing');
    const [showFilters, setShowFilters] = useState(false);

    const handleToggleFilters = () => {
        setShowFilters((prev) => !prev);
    };
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    const handleDetailsClick = (eventId) => {
        const token = localStorage.getItem('token');

        if (token) {
            navigate(`/register/${eventId}`);
        } else {
            navigate(`/guestregevent/${eventId}`);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [selectedStartDate, selectedEndDate, selectedCategories, searchTerm, eventMode]);


    const fetchEvents = () => {
        let query = new URLSearchParams();
        if (selectedStartDate) query.append("startDate", selectedStartDate);
        if (selectedEndDate) query.append("endDate", selectedEndDate);
        if (selectedCategories.length > 0) query.append("categories", selectedCategories.join(","));
        if (searchTerm.trim() !== "") query.append("search", searchTerm.trim());
        if (eventMode === "previous") query.append("mode", "previous");

        fetch(`${API_URL}/events/filter?${query.toString()}`)
            .then(response => response.json())
            .then(data => {
                setEvents(data);
            })
            .catch(error => console.error("Error fetching events:", error));
    };



    const handleStartDateChange = (e) => {
        setSelectedStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setSelectedEndDate(e.target.value);
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategories(prev =>
            e.target.checked ? [...prev, category] : prev.filter(cat => cat !== category)
        );
    };

    const formatDate = (date) => {
        if (!date) return '';
        const formattedDate = new Date(date);
        return formattedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const categories = ["Academics", "Culture", "Sports", "Social", "Tech", "Career", "Awareness", "Festivals", "Community", "Competitions", "Workshops", "Events", "InterCollege", "Clubs"];

    return (
        <div className="browsemain Main">


            <div className="browse">

                <div className={`filter-sidebar ${showFilters ? "visible" : ""}`}>
                    {showFilters && (
                        <button className="filter-hide-btn" onClick={handleToggleFilters}>
                            Hide Filters
                        </button>
                    )}
                    <div className='filters'>
                        <h3>Filter</h3>
                        <hr style={{ color: "lightseagreen", width: "100%", marginLeft: "0%" }} />

                        <div className="date-filter">
                            <h4>Start Date</h4>
                            <button onClick={() => document.getElementById("start-date-picker").showPicker()} style={selectedStartDate ? { backgroundColor: "lightseagreen" } : {}}>
                                {selectedStartDate ? formatDate(selectedStartDate) : "Select Start Date"}
                            </button>
                            <input
                                type="date"
                                id="start-date-picker"
                                value={selectedStartDate}
                                onChange={handleStartDateChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className="date-filter">
                            <h4>End Date</h4>
                            <button onClick={() => document.getElementById("end-date-picker").showPicker()} style={selectedEndDate ? { backgroundColor: "lightseagreen" } : {}}>
                                {selectedEndDate ? formatDate(selectedEndDate) : "Select End Date"}
                            </button>
                            <input
                                type="date"
                                id="end-date-picker"
                                value={selectedEndDate}
                                onChange={handleEndDateChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <hr style={{ color: "lightseagreen", width: "100%", marginLeft: "0%" }} />

                        <h4>Category</h4>
                        <div className='categories'>
                            {categories.map((category, index) => (
                                <div key={index} className='each-category'>
                                    <input
                                        type="checkbox"
                                        id={category}
                                        className='check'
                                        name="category"
                                        value={category}
                                        onChange={handleCategoryChange}
                                        checked={selectedCategories.includes(category)}
                                    />
                                    <label htmlFor={category}>{category}</label>
                                </div>
                            ))}
                        </div>

                        <hr style={{ color: "lightseagreen", width: "100%", marginLeft: "0%" }} />
                        <h4>Event Status</h4>
                        <div className='categories'>
                            <div className='each-category'>
                                <input
                                    type="radio"
                                    id="ongoing"
                                    name="eventMode"
                                    value="ongoing"
                                    checked={eventMode === 'ongoing'}
                                    onChange={() => setEventMode('ongoing')}
                                    className="check"
                                />
                                <label htmlFor="ongoing">Ongoing Events</label>
                            </div>
                            <div className='each-category'>
                                <input
                                    type="radio"
                                    id="previous"
                                    name="eventMode"
                                    value="previous"
                                    checked={eventMode === 'previous'}
                                    onChange={() => setEventMode('previous')}
                                    className="check"
                                />
                                <label htmlFor="previous">Previous Events</label>
                            </div>
                        </div>

                        <hr style={{ color: "lightseagreen", width: "100%", marginLeft: "0%" }} />
                    </div>
                </div>
                <div className='browse-list-head'>
                    {!showFilters && (
                        <button className="filter-toggle-btn" onClick={handleToggleFilters}>
                            Show Filters
                        </button>
                    )}
                    <input
                        className='searchbox'
                        type="text"
                        placeholder="Search here"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <div className='browse-list'>
                        {events.length === 0 ? (
                            <p>No events available</p>
                        ) : (
                            events.map(event => (
                                <div key={event.event_id} className='browseitem'>
                                    <img className='browsingimg' src={event.cover_image} alt={event.title} />
                                    <div className='browsingtext'>
                                        <div className='headingdate'>
                                            <div><h2>{event.title}</h2></div>
                                            <div className="date">{formatDate(event.date)}</div>
                                        </div>
                                        <div className='typetime'>
                                            <div className="type"><b>{event.categories ? event.categories.join(', ') : "General"}</b></div>
                                            <div className="time">{event.time}</div>
                                        </div>
                                        <div className='descriptionlocation'>
                                            <div className='description'>
                                                <p>{event.description.length > 250 ? event.description.slice(0, 250) + "..." : event.description}</p>
                                            </div>
                                            <div className="location">
                                                <p>{event.venue}</p>
                                                <button onClick={() => handleDetailsClick(event.event_id)}>Details</button>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Browse;
