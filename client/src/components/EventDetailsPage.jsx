import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
  Dialog,
  CircularProgress
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import WidgetWrapper from "components/WidgetWrapper";
import EditEventForm from "components/EditEventForm";


const BASE_URL = "http://localhost:3001";

const EventDetailsPage = () => {
  const { id } = useParams();
  const token = useSelector((state) => state.token);
  const [event, setEvent] = useState(null);
  const [prevEvent, setPrevEvent] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { palette } = useTheme();
  const dark = palette.neutral?.dark || "#000";
  // const isAdmin = useSelector((state) => state.user?.role === "admin");
  const isAdmin = true;
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/events/get/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEvent(data.event);
        setPrevEvent(data.previousEvent || null);
        setNextEvent(data.nextEvent || null);
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvent();
  }, [id, token]);

  const handleNextImage = () => {
    const images = event?.flyers || event?.photos || [];
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    const images = event?.flyers || event?.photos || [];
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!event || loading) {
    return (
      <Box>
        <Navbar />
        <Box
          sx={{
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          <CircularProgress color="primary" />
          <Typography variant="h6" color="text.secondary">
            Loading event details...
          </Typography>
        </Box>
      </Box>
    );
  }

  const images = event.flyers?.length > 0 ? event.flyers : event.photos || [];

  const renderImageCarousel = () => (
    <Box
      flex={1}
      sx={{
        position: "relative",
        height: isNonMobileScreens ? "400px" : "300px",
      }}
    >
      <IconButton
        onClick={handlePrevImage}
        sx={{
          position: "absolute",
          top: "50%",
          left: 0,
          transform: "translateY(-50%)",
          zIndex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "#fff",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
        }}
      >
        <ArrowBackIos />
      </IconButton>

      <img
        src={`${BASE_URL}/${images[imageIndex]?.replace(/public\\assets\\/g, "assets/")}`}
        alt="Event Visual"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: 8,
        }}
      />

      <IconButton
        onClick={handleNextImage}
        sx={{
          position: "absolute",
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
          zIndex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "#fff",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
        }}
      >
        <ArrowForwardIos />
      </IconButton>
    </Box>
  );

  const renderInfoSection = () => (
    <Box flex={1}>
      <WidgetWrapper>
        {event.location && (
          <>
            <Typography variant="h6" mt={3}>
              Location:
            </Typography>
            <Typography>{event.location}</Typography>
          </>
        )}

        <Typography variant="h6" gutterBottom mt={3}>
          Description:
        </Typography>
        <Typography variant="body1">{event.description}</Typography>

        {event.organizer && (
          <>
            <Typography variant="h6" mt={3}>
              Organizer:
            </Typography>
            <Typography>{event.organizer}</Typography>
          </>
        )}

        {/* Register Button */}
        <Box mt={4} textAlign="center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            component="a"
            href={event.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Register for Event
          </Button>
        </Box>
        {isAdmin && (
          <Box mt={2} textAlign="center">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setEditOpen(true)}
            >
              Edit Event
            </Button>
          </Box>
        )}

      </WidgetWrapper>
    </Box>
  );

  return (
    <>
    <Box>
      <Navbar />
      <Box pl={4} pt={2}>
          <Link to="/events">
            <Button variant="text" color="primary" fontSize="1.5rem">
            ← Back to Events
            </Button>
          </Link>
        </Box>
      <Box p={4} pt={1}>
        <WidgetWrapper>
          <Typography variant="h3" fontWeight="bold" color={dark} gutterBottom>
            {event.title}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {new Date(event.date).toLocaleDateString()}
          </Typography>
        </WidgetWrapper>

        {/* Responsive Layout */}
        <Box
          display="flex"
          flexDirection={isNonMobileScreens ? "row" : "column"}
          gap={4}
          mt={4}
        >
          {isNonMobileScreens ? (
            <>
              {images.length > 0 && renderImageCarousel()}
              {renderInfoSection()}
            </>
          ) : (
            <>
              {images.length > 0 && renderImageCarousel()}
              {renderInfoSection()}
            </>
          )}
        </Box>
        {(prevEvent || nextEvent) && (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={6}
            px={4}
            flexDirection={isNonMobileScreens ? "row" : "column"}
            gap={2}
          >
            {prevEvent && (
              <Box textAlign={isNonMobileScreens ? "left" : "center"}>
                <Link to={`/event/${prevEvent._id}`} style={{ textDecoration: "none" }}>
                  <Button variant="text" startIcon={<ArrowBackIos />}>
                  Previous Event
                  </Button>
                  <Typography variant="subtitle2" color="textSecondary" pl={4}>{prevEvent.title}</Typography>
                </Link>
              </Box>
            )}
            <Box flexGrow={1} />
            {nextEvent && (
              <Box textAlign={isNonMobileScreens ? "right" : "center"}>
                <Link to={`/event/${nextEvent._id}`} style={{ textDecoration: "none" }}>
                  <Button variant="text" endIcon={<ArrowForwardIos />}>
                  Next Event
                  </Button>
                  <Typography variant="subtitle2" color="textSecondary" pr={4}>{nextEvent.title}</Typography>
                </Link>
              </Box>
            )}
          </Box>
        )}

      </Box>
    </Box>
    <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
      <Box p={3}>
        <Typography variant="h5" mb={2}>
          Edit Event
        </Typography>
        <EditEventForm
          onClose={() => setEditOpen(false)}
          eventId={event._id}
          initialValues={{
            title: event.title,
            date: new Date(event.date).toISOString().split("T")[0],
            location: event.location,
            description: event.description,
            registrationLink: event.registrationLink,
            flyers: event.flyers || [],
          }}
        />
      </Box>
    </Dialog>

  </>
  );
};

export default EventDetailsPage;
