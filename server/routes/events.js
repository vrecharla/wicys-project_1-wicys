import express from 'express';
import Event from '../models/Event.js';
import multer from 'multer';
import { verifyToken } from '../middleware/auth.js';
import fs from 'fs';

const router = express.Router();

// Multer Setup (for file uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets'); // Save files in public/assets
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`); // Prevent filename conflicts
  },
});

const upload = multer({ storage });

/* ----------------------------------
  ✅ CREATE EVENT WITH MULTIPLE FLYERS & PHOTOS
------------------------------------ */
router.post('/create', verifyToken, upload.fields([{ name: 'flyers', maxCount: 20 }, { name: 'photos', maxCount: 50 }]), async (req, res) => {
  try {
    const { title, date, description, location, type, registrationLink } = req.body;

    const flyerPaths = req.files['flyers'] ? req.files['flyers'].map(file => file.path) : [];
    const photoPaths = req.files['photos'] ? req.files['photos'].map(file => file.path) : [];

    const newEvent = new Event({
      title,
      date,
      description,
      flyers: flyerPaths,
      photos: photoPaths,
      location,
      type,
      registrationLink,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ----------------------------------
  ✅ UPDATE (APPEND OR OVERWRITE) FLYERS & PHOTOS
------------------------------------ */
router.patch('/:id/upload-media', verifyToken, upload.fields([{ name: 'flyers', maxCount: 20 }, { name: 'photos', maxCount: 50 }]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    let { action } = req.body; // Action can be "append" or "overwrite"

    // Handle Flyers
    const newFlyers = req.files['flyers'] ? req.files['flyers'].map(file => file.path) : [];
    if (action === "overwrite") {
      event.flyers.forEach(file => fs.unlinkSync(file)); // Delete old files
      event.flyers = newFlyers;
    } else {
      event.flyers.push(...newFlyers);
    }

    // Handle Photos
    const newPhotos = req.files['photos'] ? req.files['photos'].map(file => file.path) : [];
    if (action === "overwrite") {
      event.photos.forEach(file => fs.unlinkSync(file)); // Delete old files
      event.photos = newPhotos;
    } else {
      event.photos.push(...newPhotos);
    }

    await event.save();
    res.status(200).json({ message: "Media updated successfully", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ----------------------------------
  ✅ DELETE SPECIFIC FLYERS OR PHOTOS
------------------------------------ */
router.patch('/:id/delete-media', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { flyersToDelete, photosToDelete } = req.body;

    // Remove specified flyers
    if (flyersToDelete && Array.isArray(flyersToDelete)) {
      event.flyers = event.flyers.filter(file => {
        if (flyersToDelete.includes(file)) {
          fs.unlinkSync(file); // Delete from filesystem
          return false;
        }
        return true;
      });
    }

    // Remove specified photos
    if (photosToDelete && Array.isArray(photosToDelete)) {
      event.photos = event.photos.filter(file => {
        if (photosToDelete.includes(file)) {
          fs.unlinkSync(file); // Delete from filesystem
          return false;
        }
        return true;
      });
    }

    await event.save();
    res.status(200).json({ message: "Selected media deleted successfully", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/* ----------------------------------
  ✅ GET UPCOMING EVENTS
------------------------------------ */
router.get('/upcoming', async (req, res) => {
  try {
    const upcomingEvents = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 });
    res.status(200).json(upcomingEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ----------------------------------
  ✅ GET PAST EVENTS
------------------------------------ */
router.get('/past', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const year = req.query.year ? parseInt(req.query.year) : currentYear;

    const startOfYear = new Date(year, 0, 1); // January 1st, 00:00:00
    const endOfYear = new Date(year, 11, 31, 23, 59, 59); // December 31st, 23:59:59

    const pastEvents = await Event.find({ 
      date: { $lt: new Date(), $gte: startOfYear, $lte: endOfYear } 
    }).sort({ date: -1 });

    res.status(200).json(pastEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



export default router;
