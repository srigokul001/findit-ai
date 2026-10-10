const Match = require('../models/Match');
const ItemReport = require('../models/ItemReport');
const { runFullMatchEngine } = require('../services/matchingEngine');

// @desc Get matches with filters
// @route GET /api/matches
const getMatches = async (req, res) => {
  try {
    const { minScore = 30, category, reportId, myMatches, status } = req.query;

    const query = {};

    if (minScore) {
      query.score = { $gte: Number(minScore) };
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (reportId) {
      query.$or = [{ lostReportId: reportId }, { foundReportId: reportId }];
    }

    // If myMatches requested and user authenticated
    if (myMatches === 'true' && req.user) {
      const myReports = await ItemReport.find({ reporterId: req.user._id }).select('_id');
      const myReportIds = myReports.map((r) => r._id);
      query.$or = [
        { lostReportId: { $in: myReportIds } },
        { foundReportId: { $in: myReportIds } },
      ];
    }

    let matches = await Match.find(query)
      .populate({
        path: 'lostReportId',
        populate: { path: 'reporterId', select: 'name email role' },
      })
      .populate({
        path: 'foundReportId',
        populate: { path: 'reporterId', select: 'name email role' },
      })
      .sort({ score: -1, createdAt: -1 })
      .lean();

    // Filter out if any report was deleted
    matches = matches.filter((m) => m.lostReportId && m.foundReportId);

    // Optional category filter
    if (category && category !== 'All') {
      matches = matches.filter(
        (m) =>
          m.lostReportId?.category === category ||
          m.foundReportId?.category === category
      );
    }

    // Redact sensitive details for public callers
    matches.forEach((m) => {
      const isLostOwner = req.user && req.user._id.toString() === m.lostReportId?.reporterId?._id?.toString();
      const isFoundOwner = req.user && req.user._id.toString() === m.foundReportId?.reporterId?._id?.toString();
      const isAdmin = req.user && req.user.role === 'admin';

      if (!isLostOwner && !isAdmin && m.lostReportId) {
        delete m.lostReportId.identifyingDetails;
      }
      if (!isFoundOwner && !isAdmin && m.foundReportId) {
        delete m.foundReportId.identifyingDetails;
      }
    });

    return res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error('[getMatches] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve matches',
      error: error.message,
    });
  }
};

// @desc Get single match by ID
// @route GET /api/matches/:id
const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate({
        path: 'lostReportId',
        populate: { path: 'reporterId', select: 'name email role campusId' },
      })
      .populate({
        path: 'foundReportId',
        populate: { path: 'reporterId', select: 'name email role campusId' },
      })
      .lean();

    if (!match || !match.lostReportId || !match.foundReportId) {
      return res.status(404).json({
        success: false,
        message: 'Match record not found',
      });
    }

    const isLostOwner = req.user && req.user._id.toString() === match.lostReportId?.reporterId?._id?.toString();
    const isFoundOwner = req.user && req.user._id.toString() === match.foundReportId?.reporterId?._id?.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isLostOwner && !isAdmin) {
      delete match.lostReportId.identifyingDetails;
    }
    if (!isFoundOwner && !isAdmin) {
      delete match.foundReportId.identifyingDetails;
    }

    return res.status(200).json({
      success: true,
      match,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get match details',
    });
  }
};

// @desc Update match status (e.g. Dismiss or Confirm)
// @route PATCH /api/matches/:id/status
const updateMatchStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['POTENTIAL', 'CONFIRMED_MATCH', 'DISMISSED', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Match status updated',
      match,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update match status',
    });
  }
};

// @desc Recalculate all matches (Admin)
// @route POST /api/matches/recalculate
const recalculateAllMatches = async (req, res) => {
  try {
    const totalMatches = await runFullMatchEngine();
    return res.status(200).json({
      success: true,
      message: `Matching engine completed. ${totalMatches} matches computed or refreshed.`,
      totalMatches,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to recalculate matches',
    });
  }
};

module.exports = {
  getMatches,
  getMatchById,
  updateMatchStatus,
  recalculateAllMatches,
};
