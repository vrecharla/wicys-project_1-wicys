import express from "express";
import { getEvents, addEvent, updateEvent, deleteEvent, uploadPhotos } from "../controllers/events.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/assets/events"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

router.get("/", getEvents);
router.post("/", verifyToken, upload.single("flyer"), addEvent);
router.patch("/:id", verifyToken, updateEvent);
router.delete("/:id", verifyToken, deleteEvent);
router.post("/:id/photos", verifyToken, upload.array("photos"), uploadPhotos);

export default router;