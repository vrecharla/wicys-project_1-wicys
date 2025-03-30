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
router.post('/create', verifyToken, upload.single('flyer'), async (req, res) => {
  try {
    // Handling file upload for the flyer (if exists)
    const flyerPath = req.file ? req.file.path : '';
    const { title, date, description, location, type, registrationLink } = req.body;

    const newEvent = new Event({
      title,
      date,
      description,
      flyer: flyerPath,
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
router.patch('/:id', verifyToken, upload.single('flyer'), async (req, res) => {
  try {
    const updatedData = req.body;

    if (req.file) {
      updatedData.flyer = req.file.path; // Update flyer if a new one is uploaded
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
