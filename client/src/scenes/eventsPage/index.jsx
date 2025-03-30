import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

const EventCalendar = ({ onSelectDate }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("/api/events").then((response) => setEvents(response.data));
  }, []);

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const eventForDate = events.find(
        (event) => new Date(event.date).toDateString() === date.toDateString()
      );
      return eventForDate ? <span className="event-indicator">●</span> : null;
    }
  };

  return <Calendar onClickDay={onSelectDate} tileContent={tileContent} />;
};

const UpcomingEvents = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    axios.get("/api/events/upcoming").then((response) => setUpcomingEvents(response.data));
  }, []);

  return (
    <div>
      <h2>Upcoming Events</h2>
      {upcomingEvents.map((event) => (
        <div key={event._id} className="event-card">
          <h3>{event.title}</h3>
          <p>{event.date}</p>
          <p>{event.description}</p>
          {event.flyer && <img src={event.flyer} alt="Event Flyer" />}
          <a href={event.registrationLink}>Register</a>
        </div>
      ))}
    </div>
  );
};

const PastEvents = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [pastEvents, setPastEvents] = useState([]);

  useEffect(() => {
    axios.get(`/api/events/past/${selectedYear}`).then((response) => setPastEvents(response.data));
  }, [selectedYear]);

  return (
    <div>
      <h2>Past Events</h2>
      <select onChange={(e) => setSelectedYear(e.target.value)}>
        {[...Array(10)].map((_, i) => (
          <option key={i} value={new Date().getFullYear() - i}>
            {new Date().getFullYear() - i}
          </option>
        ))}
      </select>
      {pastEvents.map((event) => (
        <div key={event._id} className="event-card">
          <h3>{event.title}</h3>
          <p>{event.date}</p>
          <p>{event.description}</p>
          {event.photos.map((photo, index) => (
            <img key={index} src={photo} alt="Event Photo" />
          ))}
        </div>
      ))}
    </div>
  );
};

const EventAdmin = () => {
  const [eventData, setEventData] = useState({ title: "", date: "", description: "", flyer: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(eventData).forEach((key) => formData.append(key, eventData[key]));

    await axios.post("/api/events", formData, { headers: { "Content-Type": "multipart/form-data" } });
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" onChange={(e) => setEventData({ ...eventData, title: e.target.value })} />
        <input type="date" onChange={(e) => setEventData({ ...eventData, date: e.target.value })} />
        <textarea placeholder="Description" onChange={(e) => setEventData({ ...eventData, description: e.target.value })}></textarea>
        <input type="file" onChange={(e) => setEventData({ ...eventData, flyer: e.target.files[0] })} />
        <button type="submit">Add Event</button>
      </form>
    </div>
  );
};

const EventsPage = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div>
      <EventCalendar onSelectDate={(date) => setSelectedDate(date)} />
      <UpcomingEvents />
      <PastEvents />
      <EventAdmin />
    </div>
  );
};

export default EventsPage;
