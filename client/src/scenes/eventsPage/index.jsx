import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Button, Card, CardContent, Typography, Box, IconButton, useMediaQuery, MenuItem, Select, FormControl, InputLabel, useTheme} from "@mui/material";
import { Add, ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import WidgetWrapper from "components/WidgetWrapper";


const BASE_URL = "http://localhost:3001";

const EventsPage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentUpcomingIndex, setCurrentUpcomingIndex] = useState(0);
  const [currentPastIndex, setCurrentPastIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  // const isAdmin = useSelector((state) => state.user?.role === "admin");
  const isAdmin = true;
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { palette } = useTheme();
  const dark = palette.neutral.dark;
  const primary = palette.primary.main;
  

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

  // Handle Year change for Past Events
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <Box p={2}>
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
      {/* Upcoming Events Section */}
      <WidgetWrapper m="2rem 0">

      <Box 
        sx={{
          display: "flex",
          justifyContent: isNonMobileScreens ? "space-between" : "flex-start",
          flexDirection: isNonMobileScreens ? "row" : "column",
          alignItems: "flex-start",
          mb: 2
        }}
      >
        <Typography variant="h2" fontWeight="500" color={dark} sx={{ mt: "1rem" }}>Upcoming Events</Typography>
        
      </Box>

      {/* Single Upcoming Event Display */}
      {upcomingEvents.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", gap: 2 }}>
          <IconButton
            onClick={handlePrevUpcoming}
            sx={{
              backgroundColor: primary,
              color: "#fff",
              borderRadius: "50%",
              "&:hover": {
                backgroundColor: dark,
              },
              m: 1,
            }}
            >
            <ArrowBackIos />
            </IconButton>
            
          

          <Card sx={{
            display: "flex",
            flexDirection: isNonMobileScreens ? "row" : "column",
            width: "80%",
            height: isNonMobileScreens ? "400px" : "auto"
          }}>
            <Box sx={{ width: isNonMobileScreens ? "70%" : "100%", height: "100%" }}>
              {upcomingEvents[currentUpcomingIndex]?.flyers.map((flyer, index) => (
                <img key={index}
                  src={`${BASE_URL}/${flyer.replace(/public\\assets\\/g, "assets/")}`}
                  alt={`Flyer ${index + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ))}
            </Box>

            <CardContent sx={{ width: isNonMobileScreens ? "30%" : "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography variant="h6">{upcomingEvents[currentUpcomingIndex]?.title}</Typography>
              <Typography variant="body2">{upcomingEvents[currentUpcomingIndex]?.description}</Typography>
              <Typography variant="body2">{new Date(upcomingEvents[currentUpcomingIndex]?.date).toLocaleDateString()}</Typography>
              <Box mt={2}>
                <Link to={`/event/${upcomingEvents[currentUpcomingIndex]?._id}`}>
                  <Button sx={{ ml: 1 }} variant="outlined">More Info</Button>
                </Link>
              </Box>
            </CardContent>
          </Card>

          <IconButton
            onClick={handleNextUpcoming}
            sx={{
              backgroundColor: primary,
              color: "#fff",
              borderRadius: "50%",
              "&:hover": {
                backgroundColor: dark,
              },
              m: 1,
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        </Box>
      )}
      </WidgetWrapper>


      {/* Past Events Section */}

      <WidgetWrapper m="2rem 0">

      <Box 
        sx={{
          display: "flex",
          justifyContent: isNonMobileScreens ? "space-between" : "flex-start",
          flexDirection: isNonMobileScreens ? "row" : "column",
          alignItems: "flex-start",
          mb: 2
        }}
      >
        <Typography variant="h2" fontWeight="500" color={dark} sx={{ mt: "1rem" }}>Past Events</Typography>
        <Select sx={{ mt: isNonMobileScreens ? 0 : 2 }} value={selectedYear} onChange={handleYearChange}>
        {[...Array(10)].map((_, i) => {
          const year = new Date().getFullYear() - i;
          return <MenuItem key={year} value={year}>{year}</MenuItem>;
        })}
      </Select>
      </Box>


      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", mt: 2, gap: 2}}>
      <IconButton
        onClick={handlePrevPast}
        sx={{
          backgroundColor: primary,
          color: "#fff",
          borderRadius: "50%",
          "&:hover": {
            backgroundColor: dark,
          },
          m: 1,
        }}
      >
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
              {pastEvents[currentPastIndex]?.photos.map((photo, index) => (
                <img key={index}
                  src={`${BASE_URL}/${photo}`}
                  alt={`Photo ${index + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ))}
            </Box>

            <CardContent sx={{ width: isNonMobileScreens ? "30%" : "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography variant="h6">{pastEvents[currentPastIndex]?.title}</Typography>
              <Typography variant="body2">{pastEvents[currentPastIndex]?.description}</Typography>
              <Typography variant="body2">{new Date(pastEvents[currentPastIndex]?.date).toLocaleDateString()}</Typography>
              <Box mt={2}>
                <Link to={`/event/${upcomingEvents[currentUpcomingIndex]?._id}`}>
                  <Button sx={{ ml: 1 }} variant="outlined">More Info</Button>
                </Link>
              </Box>
            </CardContent>
          </Card>
        )}

      <IconButton
        onClick={handleNextPast}
        sx={{
          backgroundColor: primary,
          color: "#fff",
          borderRadius: "50%",
          "&:hover": {
            backgroundColor: dark,
          },
          m: 1,
        }}
      >
        <ArrowForwardIos />
      </IconButton>
      </Box>
      </WidgetWrapper>


      {/* Calendar View */}
      <WidgetWrapper m="2rem 0">

      <Box 
        sx={{
          display: "flex",
          justifyContent: isNonMobileScreens ? "space-between" : "flex-start",
          flexDirection: isNonMobileScreens ? "row" : "column",
          alignItems: "flex-start",
          mb: 2
        }}
      >

      <Typography variant="h2" fontWeight="500" color={dark} sx={{ mt: "1rem" }}>Calendar View</Typography>
      </Box>
      <Box sx={{ width: "80%", margin: "0 auto" }}>
        <Calendar sx={{ width: "80%", margin: "0 auto" }}
        tileContent={({ date }) => {
          const event = calendarEvents.find(e => new Date(e.date).toDateString() === date.toDateString());
          return event ? <Typography fontSize={12}>{event.title}</Typography> : null;
        }}
      />

      </Box>
      </WidgetWrapper>
    </Box>

  );
};

export default EventsPage;
