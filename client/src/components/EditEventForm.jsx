import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";

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

const EditEventForm = ({ eventId, initialValues, onClose }) => {
  const token = useSelector((state) => state.token);
  const [flyers, setFlyers] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });

      flyers.forEach((file) => {
        formData.append("flyers", file);
      });

      try {
        const res = await fetch(`http://localhost:3001/events/update/${eventId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (res.ok) {
          alert("Event updated successfully");
          onClose();
          window.location.reload();
        } else {
          alert("Failed to update event");
        }
      } catch (err) {
        console.error("Error updating event:", err);
        alert("An error occurred while updating the event");
      }
    },
  });

  return (
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
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: today }}
          value={formik.values.date}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
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
              onChange={(e) => setFlyers([...e.target.files])}
            />
          </Button>
          {flyers.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {flyers.length} file(s) selected
            </Typography>
          )}
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button type="submit" variant="contained">
            Update
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default EditEventForm;
