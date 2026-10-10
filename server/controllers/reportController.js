const ItemReport = require('../models/ItemReport');
const Match = require('../models/Match');
const { processReportMatches } = require('../services/matchingEngine');

// @desc Create Lost Item Report
// @route POST /api/reports/lost
const createLostReport = async (req, res) => {
  try {
    const {
      itemName,
      category,
      brand,
      color,
      description,
      reportDate,
      location,
      specificLocation,
      identifyingDetails,
      contactPreference,
      imageUrl,
    } = req.body;

    if (!itemName || !category || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Item Name, Category, Description, and Campus Location',
      });
    }

    let finalImageUrl = imageUrl || '';
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const report = await ItemReport.create({
      reporterId: req.user._id,
      reportType: 'LOST',
      itemName: itemName.trim(),
      category,
      brand: brand ? brand.trim() : '',
      color: color ? color.trim() : '',
      description: description.trim(),
      reportDate: reportDate ? new Date(reportDate) : new Date(),
      location: location.trim(),
      specificLocation: specificLocation ? specificLocation.trim() : '',
      identifyingDetails: identifyingDetails ? identifyingDetails.trim() : '',
      contactPreference: contactPreference || 'in-app',
      imageUrl: finalImageUrl,
      status: 'OPEN',
    });

    // Run matching engine asynchronously
    const matches = await processReportMatches(report);

    return res.status(201).json({
      success: true,
      message: 'Lost item report submitted successfully',
      report,
      matchCount: matches.length,
    });
  } catch (error) {
    console.error('[createLostReport] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create lost report',
      error: error.message,
    });
  }
};

// @desc Create Found Item Report
// @route POST /api/reports/found
const createFoundReport = async (req, res) => {
  try {
    const {
      itemName,
      category,
      brand,
      color,
      description,
      reportDate,
      location,
      specificLocation,
      storageLocation,
      identifyingDetails,
      imageUrl,
    } = req.body;

    if (!itemName || !category || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Item Name, Category, Description, and Campus Location',
      });
    }

    let finalImageUrl = imageUrl || '';
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const report = await ItemReport.create({
      reporterId: req.user._id,
      reportType: 'FOUND',
      itemName: itemName.trim(),
      category,
      brand: brand ? brand.trim() : '',
      color: color ? color.trim() : '',
      description: description.trim(),
      reportDate: reportDate ? new Date(reportDate) : new Date(),
      location: location.trim(),
      specificLocation: specificLocation ? specificLocation.trim() : '',
      storageLocation: storageLocation ? storageLocation.trim() : 'With Finder',
      identifyingDetails: identifyingDetails ? identifyingDetails.trim() : '',
      imageUrl: finalImageUrl,
      status: 'OPEN',
    });

    // Run matching engine asynchronously
    const matches = await processReportMatches(report);

    return res.status(201).json({
      success: true,
      message: 'Found item report submitted successfully',
      report,
      matchCount: matches.length,
    });
  } catch (error) {
    console.error('[createFoundReport] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create found report',
      error: error.message,
    });
  }
};

// @desc Browse all reports with filters and pagination
// @route GET /api/reports
const getReports = async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      reportType,
      status,
      dateFrom,
      dateTo,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Filter by type
    if (reportType && ['LOST', 'FOUND'].includes(reportType.toUpperCase())) {
      query.reportType = reportType.toUpperCase();
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by campus location
    if (location && location !== 'All') {
      query.location = { $regex: new RegExp(location, 'i') };
    }

    // Filter by status
    if (status && status !== 'ALL') {
      query.status = status;
    } else if (!status) {
      // Default: show active items (OPEN and PENDING_CLAIM)
      query.status = { $in: ['OPEN', 'PENDING_CLAIM', 'RETURNED'] };
    }

    // Date range
    if (dateFrom || dateTo) {
      query.reportDate = {};
      if (dateFrom) query.reportDate.$gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.reportDate.$lte = toDate;
      }
    }

    // Keyword search
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { itemName: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { color: searchRegex },
        { location: searchRegex },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'date_desc') {
      sortOptions = { reportDate: -1 };
    } else if (sort === 'date_asc') {
      sortOptions = { reportDate: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      ItemReport.find(query)
        .populate('reporterId', 'name email role')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ItemReport.countDocuments(query),
    ]);

    // Redact private identifying details from public listing
    const sanitizedReports = reports.map((report) => {
      const isOwner = req.user && req.user._id.toString() === report.reporterId?._id?.toString();
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        delete report.identifyingDetails;
      }
      return report;
    });

    return res.status(200).json({
      success: true,
      count: sanitizedReports.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      reports: sanitizedReports,
    });
  } catch (error) {
    console.error('[getReports] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message,
    });
  }
};

// @desc Get single report by ID
// @route GET /api/reports/:id
const getReportById = async (req, res) => {
  try {
    const report = await ItemReport.findById(req.params.id)
      .populate('reporterId', 'name email campusId phone role')
      .lean();

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found',
      });
    }

    const isOwner = req.user && req.user._id.toString() === report.reporterId?._id?.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    // Redact private identifying details if not authorized
    if (!isOwner && !isAdmin) {
      delete report.identifyingDetails;
    }

    // Get any existing matches for this report
    const matchFilter =
      report.reportType === 'LOST'
        ? { lostReportId: report._id }
        : { foundReportId: report._id };

    const matches = await Match.find(matchFilter)
      .populate(report.reportType === 'LOST' ? 'foundReportId' : 'lostReportId')
      .sort({ score: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      report,
      matches,
    });
  } catch (error) {
    console.error('[getReportById] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch report details',
    });
  }
};

// @desc Update report
// @route PUT /api/reports/:id
const updateReport = async (req, res) => {
  try {
    const report = await ItemReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    const isOwner = req.user._id.toString() === report.reporterId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own reports',
      });
    }

    const allowedUpdates = [
      'itemName',
      'category',
      'brand',
      'color',
      'description',
      'reportDate',
      'location',
      'specificLocation',
      'storageLocation',
      'identifyingDetails',
      'contactPreference',
      'status',
      'imageUrl',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        report[field] = req.body[field];
      }
    });

    if (req.file) {
      report.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await report.save();

    // Trigger match update
    processReportMatches(updated).catch((err) =>
      console.error('Match re-calc error:', err)
    );

    return res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      report: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: error.message,
    });
  }
};

// @desc Delete report
// @route DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    const report = await ItemReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    const isOwner = req.user._id.toString() === report.reporterId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own reports',
      });
    }

    // Clean up matches
    await Match.deleteMany({
      $or: [{ lostReportId: report._id }, { foundReportId: report._id }],
    });

    await ItemReport.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message,
    });
  }
};

// @desc Get current user's reports
// @route GET /api/reports/user/me
const getMyReports = async (req, res) => {
  try {
    const reports = await ItemReport.find({ reporterId: req.user._id })
      .sort({ createdAt: -1 });

    const lost = reports.filter((r) => r.reportType === 'LOST');
    const found = reports.filter((r) => r.reportType === 'FOUND');

    return res.status(200).json({
      success: true,
      lost,
      found,
      total: reports.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user reports',
      error: error.message,
    });
  }
};

module.exports = {
  createLostReport,
  createFoundReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  getMyReports,
};
