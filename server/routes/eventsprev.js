import express from 'express';
import Event from '../models/Event.js';
import multer from 'multer';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Multer Setup (for file uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets'); // Save files in public/assets
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use original file name
  },
});

const upload = multer({ storage });

// POST - Create an Event
router.post('/create', verifyToken, upload.array('flyer', 20), async (req, res) => {
  try {
    // Handling file upload for the flyer (if exists)
    const flyerPaths = req.files ? req.files.map(file => file.path) : [];
    const { title, date, description, location, type, registrationLink } = req.body;

    const newEvent = new Event({
      title,
      date,
      description,
      flyer: flyerPaths,
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

// GET - Get all upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const upcomingEvents = await Event.find({ date: { $gte: new Date() } });
    res.status(200).json(upcomingEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Get all past events
router.get('/past', async (req, res) => {
  try {
    const pastEvents = await Event.find({ date: { $lt: new Date() } });
    res.status(200).json(pastEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Get Event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).send('Event not found');
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Update Event
router.patch('/:id', verifyToken, upload.array('flyer', 20), async (req, res) => {
  try {
    const updatedData = req.body;

    if (req.files) {
      updatedData.flyer = req.files.map(file => file.path); // Store multiple flyer paths
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Allow multiple photos
router.post('/upload-photos/:id', verifyToken, upload.array('photos', 50), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const photoPaths = req.files ? req.files.map(file => file.path) : []; // Store multiple photo paths

    event.photos.push(...photoPaths); // Append new photos to the existing array
    await event.save();

    res.status(200).json({ message: "Photos uploaded successfully", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.patch('/:id/update-photos', verifyToken, upload.array('photos', 50), async (req, res) => {
  try {
    const updatedData = req.body;
    
    if (req.files) {
      updatedData.photos = req.files.map(file => file.path); // Overwrite existing photos
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;
