import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Button, Card, CardContent, Typography, Box, IconButton, useMediaQuery } from "@mui/material";
import { Add, ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const BASE_URL = "http://localhost:3001";

const EventsPage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentUpcomingIndex, setCurrentUpcomingIndex] = useState(0);
  const [currentPastIndex, setCurrentPastIndex] = useState(0);
  const isAdmin = useSelector((state) => state.user?.role === "admin");
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  useEffect(() => {
    fetchEvents();
  }, [selectedYear]);

  const fetchEvents = async () => {
    try {
      const upcomingRes = await fetch(`${BASE_URL}/events/upcoming`);
      const pastRes = await fetch(`${BASE_URL}/events/past?year=${selectedYear}`);

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

  const handleNextUpcoming = () => setCurrentUpcomingIndex((prev) => (prev + 1) % upcomingEvents.length);
  const handlePrevUpcoming = () => setCurrentUpcomingIndex((prev) => (prev - 1 + upcomingEvents.length) % upcomingEvents.length);
  
  const handleNextPast = () => setCurrentPastIndex((prev) => (prev + 1) % pastEvents.length);
  const handlePrevPast = () => setCurrentPastIndex((prev) => (prev - 1 + pastEvents.length) % pastEvents.length);

  return (
    <Box p={2}>

      {/* Upcoming Events Section */}
      <Box 
        sx={{
          display: "flex",
          justifyContent: isNonMobileScreens ? "space-between" : "flex-start",
          flexDirection: isNonMobileScreens ? "row" : "column",
          alignItems: "flex-start",
          mb: 2
        }}
      >
        <Typography variant="h5">Upcoming Events</Typography>
        
        {isAdmin && (
          <Button 
            startIcon={<Add />} 
            variant="contained" 
            color="primary"
            sx={{ mt: isNonMobileScreens ? 0 : 2 }} // Add margin-top only on mobile
          >
            Create Event
          </Button>
        )}
      </Box>

      {/* Single Upcoming Event Display */}
      {upcomingEvents.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <IconButton onClick={handlePrevUpcoming}>
            <ArrowBackIos />
          </IconButton>

          <Card sx={{
            display: "flex",
            flexDirection: isNonMobileScreens ? "row" : "column",
            width: "80%",
            height: isNonMobileScreens ? "400px" : "auto"
          }}>
            <Box sx={{ width: isNonMobileScreens ? "70%" : "100%", height: "100%" }}>
              <img 
                src={upcomingEvents[currentUpcomingIndex]?.flyerUrl || "/default-flyer.jpg"} 
                alt="Event Flyer" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
            <CardContent sx={{ width: isNonMobileScreens ? "30%" : "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography variant="h6">{upcomingEvents[currentUpcomingIndex]?.title}</Typography>
              <Typography variant="body2">{upcomingEvents[currentUpcomingIndex]?.description}</Typography>
              <Typography variant="body2">{new Date(upcomingEvents[currentUpcomingIndex]?.date).toLocaleDateString()}</Typography>
              <Box mt={2}>
                <Button variant="contained" color="primary">Register</Button>
                <Link to={`/event/${upcomingEvents[currentUpcomingIndex]?._id}`}>
                  <Button sx={{ ml: 1 }} variant="outlined">More Info</Button>
                </Link>
              </Box>
            </CardContent>
          </Card>

          <IconButton onClick={handleNextUpcoming}>
            <ArrowForwardIos />
          </IconButton>
        </Box>
      )}

      {/* Past Events Section */}
      <Typography variant="h5" mt={2}>Past Events</Typography>
      
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", mt: 2 }}>
        <IconButton onClick={handlePrevPast}>
          <ArrowBackIos />
        </IconButton>

        {pastEvents.length > 0 && (
          <Card sx={{
            display: "flex",
            flexDirection: isNonMobileScreens ? "row" : "column",
            width: "80%",
            height: isNonMobileScreens ? "400px" : "auto"
          }}>
            <Box sx={{ width: isNonMobileScreens ? "70%" : "100%", height: "100%" }}>
              <img 
                src={pastEvents[currentPastIndex]?.flyerUrl || "/default-flyer.jpg"} 
                alt="Past Event Flyer" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
            <CardContent sx={{ width: isNonMobileScreens ? "30%" : "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography variant="h6">{pastEvents[currentPastIndex]?.title}</Typography>
              <Typography variant="body2">{pastEvents[currentPastIndex]?.description}</Typography>
              <Typography variant="body2">{new Date(pastEvents[currentPastIndex]?.date).toLocaleDateString()}</Typography>
            </CardContent>
          </Card>
        )}

        <IconButton onClick={handleNextPast}>
          <ArrowForwardIos />
        </IconButton>
      </Box>

      {/* Calendar View */}
      <Typography variant="h5" mt={2}>Calendar View</Typography>
      <Box sx={{ width: "80%", margin: "0 auto" }}>
        <Calendar sx={{ width: "80%", margin: "0 auto" }}
          tileContent={({ date }) => {
            const event = calendarEvents.find(e => new Date(e.date).toDateString() === date.toDateString());
            return event ? <Typography fontSize={12}>{event.title}</Typography> : null;
          }}
        />
      </Box>

    </Box>
  );
};

export default EventsPage;
