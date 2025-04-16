import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Button, Card, CardContent, Typography, Box, IconButton, useMediaQuery, MenuItem, Select, FormControl, InputLabel, useTheme} from "@mui/material";
import { Add, ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import WidgetWrapper from "components/WidgetWrapper";
import CreateEventForm from "components/CreateEventForm";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Navbar from "scenes/navbar";

const BASE_URL = "http://localhost:3001";

const EventsPage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentUpcomingIndex, setCurrentUpcomingIndex] = useState(0);
  const [currentPastIndex, setCurrentPastIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [upcomingImageIndex, setUpcomingImageIndex] = useState(0);
  const [pastImageIndex, setPastImageIndex] = useState(0);
  const [openCreateEvent, setOpenCreateEvent] = useState(false);
  // const isAdmin = useSelector((state) => state.user?.role === "admin");
  const isAdmin = true;
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { palette } = useTheme();
  const dark = palette.neutral.dark;
  const primary = palette.primary.main;
  const token = useSelector((state) => state.token);
  
  useEffect(() => {
    fetchEvents();
  }, [selectedYear]);

  const fetchEvents = async () => {
    try {
      const upcomingRes = await fetch(`${BASE_URL}/events/upcoming`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const pastRes = await fetch(`${BASE_URL}/events/past?year=${selectedYear}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const handleOpenCreateEvent = () => setOpenCreateEvent(true);
  const handleCloseCreateEvent = () => setOpenCreateEvent(false);

  useEffect(() => {
    setUpcomingImageIndex(0);
  }, [currentUpcomingIndex]);
  
  useEffect(() => {
    setPastImageIndex(0);
  }, [currentPastIndex]);

  const handleNextImage = (type) => {
    if (type === "upcoming") {
      const flyers = upcomingEvents[currentUpcomingIndex]?.flyers || [];
      setUpcomingImageIndex((prev) => (prev + 1) % flyers.length);
    } else {
      const photos = pastEvents[currentPastIndex]?.photos || [];
      setPastImageIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const handlePrevImage = (type) => {
    if (type === "upcoming") {
      const flyers = upcomingEvents[currentUpcomingIndex]?.flyers || [];
      setUpcomingImageIndex((prev) => (prev - 1 + flyers.length) % flyers.length);
    } else {
      const photos = pastEvents[currentPastIndex]?.photos || [];
      setPastImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };
  

  // Handle Year change for Past Events
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
    setCurrentPastIndex(0);
  };

  return (
    <>
    <Navbar />
    <Box p={2}>
      {isAdmin && (
          <Button 
            startIcon={<Add />} 
            variant="contained" 
            color="primary"
            onClick={handleOpenCreateEvent}
            sx={{ mt: isNonMobileScreens ? 0 : 2 }}
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
      {upcomingEvents.length > 0 ? (
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
            {upcomingEvents[currentUpcomingIndex]?.flyers?.length > 0 && (
              <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                <IconButton
                  onClick={() => handlePrevImage("upcoming")}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" }
                  }}
                >
                  <ArrowBackIos fontSize="small" />
                </IconButton>

                <img
                  src={`${BASE_URL}/${upcomingEvents[currentUpcomingIndex]?.flyers[upcomingImageIndex].replace(/public\\assets\\/g, "assets/")}`}
                  alt={`Flyer`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />

                <IconButton
                  onClick={() => handleNextImage("upcoming")}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: 0,
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" }
                  }}
                >
                  <ArrowForwardIos fontSize="small" />
                </IconButton>
              </Box>
            )}
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
      ) : (
        <Box sx={{ textAlign: "center", mt: 2 }}>
        {/* <SentimentDissatisfiedOutlinedIcon fontSize="large" color="disabled" /> */}
        <Typography variant="h2" component="div">😔</Typography>
        <Typography variant="h3" color="textSecondary">
          No upcoming events found.
        </Typography>
      </Box> )}
      </WidgetWrapper>


      {/* Past Events Section */}

      <WidgetWrapper m="2rem 0">

      <Box 
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 2
        }}
      >
        <Typography 
          variant="h2" 
          fontWeight="500" 
          color={dark}
        >
          Past Events For
        </Typography>

        <FormControl variant="standard" sx={{ minWidth: 100 }}>
          <Select
            value={selectedYear}
            onChange={handleYearChange}
            disableUnderline
            sx={{
              fontSize: 32,
              fontWeight: 500,
              color: primary,
              "& .MuiSelect-icon": {
                color: primary,
              },
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            {[...Array(10)].map((_, i) => {
              const year = new Date().getFullYear() - i;
              return <MenuItem key={year} value={year}>{year}</MenuItem>;
            })}
          </Select>
        </FormControl>
      </Box>

      {pastEvents.length > 0 ? (

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
              {pastEvents[currentPastIndex]?.photos?.length > 0 && (
                <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                  <IconButton
                    onClick={() => handlePrevImage("past")}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: 0,
                      transform: "translateY(-50%)",
                      zIndex: 1,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "#fff",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" }
                    }}
                  >
                    <ArrowBackIos fontSize="small" />
                  </IconButton>

                  <img
                    src={`${BASE_URL}/${pastEvents[currentPastIndex]?.photos[pastImageIndex].replace(/public\\assets\\/g, "assets/")}`}
                    alt={`Photo`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />

                  <IconButton
                    onClick={() => handleNextImage("past")}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      right: 0,
                      transform: "translateY(-50%)",
                      zIndex: 1,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "#fff",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" }
                    }}
                  >
                    <ArrowForwardIos fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>

            <CardContent sx={{ width: isNonMobileScreens ? "30%" : "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography variant="h6">{pastEvents[currentPastIndex]?.title}</Typography>
              <Typography variant="body2">{pastEvents[currentPastIndex]?.description}</Typography>
              <Typography variant="body2">{new Date(pastEvents[currentPastIndex]?.date).toLocaleDateString()}</Typography>
              <Box mt={2}>
                <Link to={`/event/${pastEvents[currentPastIndex]?._id}`}>
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
      ) : (
        <Box sx={{ textAlign: "center", mt: 2 }}>
        {/* <SentimentDissatisfiedOutlinedIcon fontSize="large" color="disabled" /> */}
        <Typography variant="h2" component="div">😔</Typography>
        <Typography variant="h3" color="textSecondary">
          No past events found for {selectedYear}.
        </Typography>
      </Box> )}
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
      {selectedDate && (
          <Box 
            sx={{ 
              mt: 4, 
              display: "flex", 
              flexDirection: isNonMobileScreens ? "row" : "column", 
              gap: 2 
            }}
          >
            <Box sx={{ width: isNonMobileScreens ? "50%" : "100%" }}>
            <Box
              sx={{
                width: "100%",
                maxWidth: 800,
                height: "100%",
                maxHeight: 500,
                backgroundColor: palette.background.paper,
                borderRadius: 2,
                p: 2,
                boxShadow: 3,
                fontFamily: "Roboto, sans-serif",
                "& .react-calendar": {
                  width: "100%",
                  border: "none",
                  fontFamily: "inherit",
                },
                "& .react-calendar__tile": {
                  padding: "0.75rem 0.5rem",
                  borderRadius: 1,
                  transition: "all 0.2s ease-in-out",
                  fontSize: "0.875rem",
                  "&:hover": {
                    backgroundColor: palette.action.hover,
                  },
                },
                "& .react-calendar__tile--active": {
                  backgroundColor: primary,
                  color: "#000",
                },
                "& .react-calendar__tile--now": {
                  backgroundColor: palette.secondary.light,
                  fontWeight: "bold",
                },
                "& .react-calendar__navigation button": {
                  color: primary,
                  fontWeight: "bold",
                  fontSize: "1rem",
                  "&:hover": {
                    backgroundColor: palette.action.hover,
                  },
                },
              }}
            >
              <Calendar
                onClickDay={(date) => setSelectedDate(date)}
                tileContent={({ date }) => {
                  const event = calendarEvents.find(
                    (e) => new Date(e.date).toDateString() === date.toDateString()
                  );
                  return event ? (
                    <Typography fontSize={10} color="primary">
                      {event.title}
                    </Typography>
                  ) : null;
                }}
              />
            </Box>
            </Box>

            <Box sx={{ width: isNonMobileScreens ? "50%" : "100%", p: 2, border: `1px solid ${dark}`, borderRadius: 2 }}>
              {calendarEvents.some(e => new Date(e.date).toDateString() === selectedDate.toDateString()) ? (
                calendarEvents
                  .filter(e => new Date(e.date).toDateString() === selectedDate.toDateString())
                  .map((event, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box>
                        <Typography variant="h6">{event.title}</Typography>
                        <Typography variant="body2">{event.description}</Typography>
                        <Typography variant="caption">
                          {new Date(event.date).toLocaleDateString()}
                        </Typography>
                        </Box>
                        <Box>
                          <Link to={`/event/${event._id}`}>
                            <Button sx={{ ml: 1 }} variant="outlined">More Info</Button>
                          </Link>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <Box sx={{ display: "flex", textAlign: "center", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column",}}>
                <Typography variant="h2" component="div">😔</Typography>
                <Typography component="div">No events found on this date.</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

      </Box>
      </WidgetWrapper>
    </Box>

    <Dialog open={openCreateEvent} onClose={handleCloseCreateEvent} maxWidth="md" fullWidth>
      <DialogTitle>Create New Event</DialogTitle>
      <DialogContent dividers>
        <CreateEventForm onClose={handleCloseCreateEvent} />
      </DialogContent>
    </Dialog>
  </>

  );
};

export default EventsPage;
