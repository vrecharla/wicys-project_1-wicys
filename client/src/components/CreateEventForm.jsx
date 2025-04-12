import React, { useState } from "react";
import { Button, TextField, Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";

const CreateEventForm = ({ onClose }) => {
  const token = useSelector((state) => state.token);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    registrationLink: "",
  });

  const [flyers, setFlyers] = useState([]);
  const [photos, setPhotos] = useState([]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, setFiles) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      eventData.append(key, value);
    });

    flyers.forEach((file) => eventData.append("flyers", file));
    photos.forEach((file) => eventData.append("photos", file));

    const res = await fetch("http://localhost:3001/events/create", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: eventData,
    });

    if (res.ok) {
      alert("Event created successfully");
      onClose();
    } else {
      alert("Failed to create event");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h4">Create Event</Typography>
      <TextField label="Event Name" name="title" fullWidth onChange={handleChange} sx={{ my: 1 }} />
      <TextField type="date" name="date" fullWidth onChange={handleChange} sx={{ my: 1 }} />
      <TextField label="Location" name="location" fullWidth onChange={handleChange} sx={{ my: 1 }} />
      <TextField label="Description" name="description" fullWidth multiline rows={3} onChange={handleChange} sx={{ my: 1 }} />
      <TextField label="Registration Link" name="registrationLink" fullWidth onChange={handleChange} sx={{ my: 1 }} />

      <Typography sx={{ mt: 2 }}>Upload Flyers (Max 20):</Typography>
      <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, setFlyers)} />

      <Box mt={2}>
        <Button type="submit" variant="contained">Submit</Button>
        <Button onClick={onClose} sx={{ ml: 2 }}>Cancel</Button>
      </Box>
    </Box>
  );
};

export default CreateEventForm;