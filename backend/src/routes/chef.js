const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const multer = require('multer');

const router = express.Router();
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const unique = `${Date.now()}_${safe}`;
    cb(null, unique);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image uploads allowed'));
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/images', async (_req, res) => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    const files = await fs.readdir(uploadsDir);
    const images = files
      .filter((file) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file))
      .map((file) => ({ name: file, url: `/uploads/${file}` }));
    res.json({ images });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list images' });
  }
});

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' });
  }
  return res.status(201).json({
    image: {
      name: req.file.filename,
      url: `/uploads/${req.file.filename}`,
    },
  });
});

module.exports = router;
