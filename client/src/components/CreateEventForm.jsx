import React, { useState } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  Dialog
} from "@mui/material";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRef } from "react";

const validationSchema = Yup.object({
  title: Yup.string().required("Event name is required"),
  date: Yup.date()
    .required("Date is required")
    .min(new Date(new Date().setHours(0, 0, 0, 0)), "Date must be today or in the future"),
  location: Yup.string().required("Location is required"),
  description: Yup.string().required("Description is required"),
  registrationLink: Yup.string()
    .url("Enter a valid URL")
    .required("Registration link is required"),
});

const CreateEventForm = ({ onClose }) => {
  const token = useSelector((state) => state.token);
  const [flyers, setFlyers] = useState([]);
  const today = new Date().toISOString().split("T")[0];
  const [enlargedImage, setEnlargedImage] = useState(null);
  const fileInputRef = useRef();
  const [flyerPreviews, setFlyerPreviews] = useState([]);

  const formik = useFormik({
    initialValues: {
      title: "",
      date: "",
      location: "",
      description: "",
      registrationLink: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const eventData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        eventData.append(key, value);
      });
      flyers.forEach((file) => eventData.append("flyers", file));

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
    },
  });

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
  
    // Filter out duplicates (optional: based on name/size/type)
    const existingNames = flyers.map((f) => f.name);
    const uniqueNewFiles = newFiles.filter((file) => !existingNames.includes(file.name));
  
    const mergedFlyers = [...flyers, ...uniqueNewFiles];
    const mergedPreviews = [
      ...flyerPreviews,
      ...uniqueNewFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ];
  
    setFlyers(mergedFlyers);
    setFlyerPreviews(mergedPreviews);
  
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const removeFlyerPreview = (index) => {
    const updatedFlyers = flyers.filter((_, i) => i !== index);
    const updatedPreviews = flyerPreviews.filter((_, i) => i !== index);
  
    setFlyers(updatedFlyers);
    setFlyerPreviews(updatedPreviews);
  }; 

  return (
    <>
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Event Name"
          name="title"
          fullWidth
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={formik.touched.title && formik.errors.title}
        />
        <TextField
          type="date"
          name="date"
          fullWidth
          value={formik.values.date}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: today }}
          error={formik.touched.date && Boolean(formik.errors.date)}
          helperText={formik.touched.date && formik.errors.date}
        />
        <TextField
          label="Location"
          name="location"
          fullWidth
          value={formik.values.location}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.location && Boolean(formik.errors.location)}
          helperText={formik.touched.location && formik.errors.location}
        />
        <TextField
          label="Description"
          name="description"
          fullWidth
          multiline
          rows={4}
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
        />
        <TextField
          label="Registration Link"
          name="registrationLink"
          fullWidth
          value={formik.values.registrationLink}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.registrationLink && Boolean(formik.errors.registrationLink)}
          helperText={formik.touched.registrationLink && formik.errors.registrationLink}
        />

        <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Upload New Flyers (Optional):
                  </Typography>
                  <Button variant="outlined" component="label">
                    Upload Flyers
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef} 
                    />
                  </Button>
                  {flyers.length > 0 && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {flyers.length} file(s) selected
                    </Typography>
                  )}
                </Box>
        
                {flyerPreviews.length > 0 && (
                <Stack direction="row" spacing={2} mt={2} flexWrap="wrap">
                    {flyerPreviews.map((item, index) => (
                    <Box key={index} sx={{ position: "relative", width: 100, height: 100 }}>
                        <Box
                          sx={{
                            position: "relative",
                            width: 100,
                            height: 100,
                            borderRadius: 2,
                            overflow: "hidden",
                            cursor: "pointer",
                            "&:hover .overlay": {
                              opacity: 1,
                            },
                          }}
                          onClick={() => setEnlargedImage(item.preview)}
                        >
                          <img
                            src={item.preview}
                            alt={`Flyer preview ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 8,
                              display: "block",
                            }}
                          />
        
                          {/* Overlay with specific color */}
                          <Box
                            className="overlay"
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              backgroundColor: "rgba(0, 0, 0, 0.5)", // Customize this color and opacity
                              opacity: 0,
                              transition: "opacity 0.3s ease",
                              borderRadius: 2,
                            }}
                          />
                        </Box>
        
                        <Button
                        size="large"
                        onClick={() => removeFlyerPreview(index)}
                        sx={{
                            position: "absolute",
                            top: -10,
                            right: -10,
                            minWidth: 0,
                            padding: "2px 6px",
                            borderRadius: "50%",
                            backgroundColor: "#fff",
                            color: "red",
                            fontWeight: "bold",
                            lineHeight: 1,
                            fontSize: "25px",
                            boxShadow: 1,
                            zIndex: 1,
                            '&:hover': {
                              backgroundColor: "#f5f5f5",
                            },
                        }}
                        >
                        ×
                        </Button>
                    </Box>
                    ))}
                </Stack>
                )}

        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button variant="contained" type="submit">
            Submit
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Stack>
    </Box>
    <Dialog open={!!enlargedImage} onClose={() => setEnlargedImage(null)} maxWidth="lg">
            {enlargedImage && (
              <Box p={2}>
              <img
                src={enlargedImage}
                alt="Enlarged Preview"
                style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 8 }}
              />
              </Box>
            )}
        </Dialog>
    </>
  );
};

export default CreateEventForm;
