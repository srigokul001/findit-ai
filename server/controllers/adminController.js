const User = require('../models/User');
const ItemReport = require('../models/ItemReport');
const Match = require('../models/Match');
const Claim = require('../models/Claim');

// @desc Get comprehensive admin statistics
// @route GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLost,
      totalFound,
      totalMatches,
      highScoreMatches,
      pendingClaims,
      completedClaims,
      returnedItems,
    ] = await Promise.all([
      User.countDocuments(),
      ItemReport.countDocuments({ reportType: 'LOST' }),
      ItemReport.countDocuments({ reportType: 'FOUND' }),
      Match.countDocuments(),
      Match.countDocuments({ score: { $gte: 75 } }),
      Claim.countDocuments({ status: 'PENDING' }),
      Claim.countDocuments({ status: 'COMPLETED' }),
      ItemReport.countDocuments({ status: 'RETURNED' }),
    ]);

    const totalReports = totalLost + totalFound;
    const recoveryRate = totalReports > 0 ? Math.round((returnedItems / totalReports) * 100) : 0;

    // Category distribution
    const categoryAgg = await ItemReport.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Location distribution
    const locationAgg = await ItemReport.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Recent activities (recent reports, claims)
    const recentReports = await ItemReport.find()
      .populate('reporterId', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    const recentClaims = await Claim.find()
      .populate('itemReportId', 'itemName reportType')
      .populate('claimantId', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalLost,
        totalFound,
        totalReports,
        totalMatches,
        highScoreMatches,
        pendingClaims,
        completedClaims,
        returnedItems,
        recoveryRate,
      },
      categoryBreakdown: categoryAgg.map((c) => ({ category: c._id, count: c.count })),
      locationBreakdown: locationAgg.map((l) => ({ location: l._id, count: l.count })),
      recentActivity: {
        recentReports,
        recentClaims,
      },
    });
  } catch (error) {
    console.error('[getAdminStats] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics',
      error: error.message,
    });
  }
};

// @desc Get all registered users (Admin only)
// @route GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

// @desc Update user role (Admin only)
// @route PATCH /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-passwordHash');

    return res.status(200).json({
      success: true,
      message: 'User role updated',
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role',
    });
  }
};

// @desc Toggle suspicious flag on report
// @route PATCH /api/admin/reports/:id/suspicious
const toggleSuspicious = async (req, res) => {
  try {
    const report = await ItemReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.isSuspicious = !report.isSuspicious;
    await report.save();

    return res.status(200).json({
      success: true,
      message: `Report marked as ${report.isSuspicious ? 'suspicious' : 'verified'}`,
      isSuspicious: report.isSuspicious,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update flag',
    });
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  updateUserRole,
  toggleSuspicious,
};
