const express = require('express');
const router = express.Router();
const {
  getMatches,
  getMatchById,
  updateMatchStatus,
  recalculateAllMatches,
} = require('../controllers/matchController');
const { protect, optionalAuth, adminOnly } = require('../middleware/auth');

router.get('/', optionalAuth, getMatches);
router.get('/:id', optionalAuth, getMatchById);
router.patch('/:id/status', protect, updateMatchStatus);
router.post('/recalculate', protect, adminOnly, recalculateAllMatches);

module.exports = router;
