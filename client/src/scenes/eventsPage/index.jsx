import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Button, Card, CardContent, Typography, Box, Select, MenuItem } from "@mui/material";
import { Add } from "@mui/icons-material";
import "./eventsPage.css";


const EventsPage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const isAdmin = useSelector((state) => state.role === "admin");

  useEffect(() => {
    fetchEvents();
  }, [selectedYear]);

  const fetchEvents = async () => {
    try {
      const upcomingRes = await fetch("http://localhost:3001/events/upcoming");
      const pastRes = await fetch(`http://localhost:3001/events/past?year=${selectedYear}`);

      if (!upcomingRes.ok) throw new Error("Failed to fetch upcoming events");
      if (!pastRes.ok) throw new Error("Failed to fetch past events");

      const upcomingData = await upcomingRes.json();
      const pastData = await pastRes.json();

      setUpcomingEvents(upcomingData || []);
      setPastEvents(pastData || []);
      setCalendarEvents([...upcomingData, ...pastData]);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleYearChange = (event) => setSelectedYear(event.target.value);

  return (
    <Box p={2}>
      {isAdmin && (
        <Button startIcon={<Add />} variant="contained" color="primary">
          Create Event
        </Button>
      )}

      {/* Upcoming Events Section */}
      <Typography variant="h5" mt={2}>Upcoming Events</Typography>
      <Box sx={{ display: "flex", overflowX: "auto", gap: 2, p: 1 }}>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(event => (
            <Card key={event._id} sx={{ minWidth: 250 }}>
              <CardContent>
                <Typography variant="h6">{event.title}</Typography>
                <Typography variant="body2">{new Date(event.date).toLocaleDateString()}</Typography>
                <Link to={`/event/${event._id}`}>
                  <Button variant="contained" color="primary">Register</Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography>No upcoming events</Typography>
        )}
      </Box>

      {/* Past Events Section */}
      <Typography variant="h5" mt={2}>Past Events</Typography>
      <Select value={selectedYear} onChange={handleYearChange}>
        {[...Array(10)].map((_, i) => {
          const year = new Date().getFullYear() - i;
          return <MenuItem key={year} value={year}>{year}</MenuItem>;
        })}
      </Select>
      <Box sx={{ display: "flex", overflowX: "auto", gap: 2, p: 1 }}>
        {pastEvents.length > 0 ? (
          pastEvents.map(event => (
            <Card key={event._id} sx={{ minWidth: 250 }}>
              <CardContent>
                <Typography variant="h6">{event.title}</Typography>
                <Typography variant="body2">{new Date(event.date).toLocaleDateString()}</Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography>No past events for {selectedYear}</Typography>
        )}
      </Box>

      {/* Calendar View */}
      <Typography variant="h5" mt={2}>Calendar View</Typography>
      <Calendar
        tileContent={({ date }) => {
          const event = calendarEvents.find(e => new Date(e.date).toDateString() === date.toDateString());
          return event ? <Typography fontSize={12}>{event.title}</Typography> : null;
        }}
      />
    </Box>
  );
};

export default EventsPage;
