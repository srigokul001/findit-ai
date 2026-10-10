const express = require('express');
const router = express.Router();
const {
  createClaim,
  getMyClaims,
  getClaims,
  reviewClaim,
} = require('../controllers/claimController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createClaim);
router.get('/my', protect, getMyClaims);
router.get('/', protect, getClaims);
router.patch('/:id/review', protect, reviewClaim);

module.exports = router;
