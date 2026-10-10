const express = require('express');
const router = express.Router();
const {
  createLostReport,
  createFoundReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  getMyReports,
} = require('../controllers/reportController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public or optionalAuth routes
router.get('/', optionalAuth, getReports);
router.get('/user/me', protect, getMyReports);
router.get('/:id', optionalAuth, getReportById);

// Protected routes
router.post('/lost', protect, upload.single('image'), createLostReport);
router.post('/found', protect, upload.single('image'), createFoundReport);
router.put('/:id', protect, upload.single('image'), updateReport);
router.delete('/:id', protect, deleteReport);

module.exports = router;
