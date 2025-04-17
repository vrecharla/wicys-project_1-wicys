import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Dialog,
  useTheme
} from "@mui/material";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRef } from "react";

const BASE_URL = "http://localhost:3001";

const UploadPhotosForm = ({ eventId, initialValues, onClose }) => {
  const token = useSelector((state) => state.token);
  const [existingPhotos, setExistingPhotos] = useState(initialValues.photos || []);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const fileInputRef = useRef();

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });

      photos.forEach((file) => {
        formData.append("photos", file);
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
          alert("Photos uploaded successfully");
          onClose();
          window.location.reload();
        } else {
          alert("Failed to upload photos");
        }
      } catch (err) {
        console.error("Error uploading photos:", err);
        alert("An error occurred while uploading photos");
      }
    },
  });

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
  
    // Filter out duplicates (optional: based on name/size/type)
    const existingNames = photos.map((f) => f.name);
    const uniqueNewFiles = newFiles.filter((file) => !existingNames.includes(file.name));
  
    const mergedPhotos = [...photos, ...uniqueNewFiles];
    const mergedPreviews = [
      ...photoPreviews,
      ...uniqueNewFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ];
  
    setPhotos(mergedPhotos);
    setPhotoPreviews(mergedPreviews);
  
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };
  
  

  const removePhotoPreview = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
  
    setPhotos(updatedPhotos);
    setPhotoPreviews(updatedPreviews);
  };  
  

  return (
    <>
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Selected Photos:
          </Typography>
          <Button variant="outlined" component="label">
            Select Photos
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef} 
            />
          </Button>
          {photos.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {photos.length} file(s) selected
            </Typography>
          )}
        </Box>

        <Box minHeight={400}>
        {photoPreviews.length > 0 && (
        <Stack direction="row" spacing={2} mt={2} flexWrap="wrap">
            {photoPreviews.map((item, index) => (
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
                    alt={`Photo preview ${index + 1}`}
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
                onClick={() => removePhotoPreview(index)}
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


        {existingPhotos.length > 0 && (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Current Photos:</Typography>
            <Stack direction="row" spacing={2} mt={1} flexWrap="wrap">
            {existingPhotos.map((photoPath, index) => (
                <Box key={index} sx={{ 
                  width: 100, 
                  height: 100,
                  }}>
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
                  onClick={() => setEnlargedImage(`${BASE_URL}/${photoPath?.replace(/public\\assets\\/g, "assets/")}`)}
                >
                  <img
                    src={`${BASE_URL}/${photoPath?.replace(/public\\assets\\/g, "assets/")}`}
                    alt={`Photo preview ${index + 1}`}
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
                      backgroundColor: "rgba(0, 0, 0, 0.6)", // Customize this color and opacity
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                      borderRadius: 2,
                    }}
                  />
                </Box>
                </Box>
            ))}
            </Stack>
        </Box>
        )}
        </Box>


        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button type="submit" variant="contained">
            Upload
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Stack>
    </Box>
    <Dialog open={!!enlargedImage} onClose={() => setEnlargedImage(null)} maxWidth="lg">
        <Box p={2}>
            <img
            src={
                enlargedImage
                ? enlargedImage
                : ""
            }
            alt="Enlarged Photo"
            style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 8 }}
            />
        </Box>
    </Dialog>

    </>
  );
};

export default UploadPhotosForm;
