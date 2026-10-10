const Claim = require('../models/Claim');
const ItemReport = require('../models/ItemReport');
const Notification = require('../models/Notification');
const Match = require('../models/Match');

// @desc Submit an item ownership claim
// @route POST /api/claims
const createClaim = async (req, res) => {
  try {
    const {
      itemReportId,
      privateVerificationDetails,
      claimReason,
      contactPhone,
      contactEmail,
      proofImageUrl,
    } = req.body;

    if (!itemReportId || !privateVerificationDetails) {
      return res.status(400).json({
        success: false,
        message: 'Item report ID and private verification details are required',
      });
    }

    const itemReport = await ItemReport.findById(itemReportId);
    if (!itemReport) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found',
      });
    }

    if (itemReport.status === 'RETURNED') {
      return res.status(400).json({
        success: false,
        message: 'This item has already been returned and resolved',
      });
    }

    // Check if user already submitted pending claim for this item
    const existingClaim = await Claim.findOne({
      itemReportId,
      claimantId: req.user._id,
      status: { $in: ['PENDING', 'APPROVED'] },
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active claim submitted for this item',
      });
    }

    const claim = await Claim.create({
      itemReportId,
      claimantId: req.user._id,
      privateVerificationDetails: privateVerificationDetails.trim(),
      claimReason: claimReason ? claimReason.trim() : '',
      contactInfo: {
        email: contactEmail || req.user.email,
        phone: contactPhone || req.user.phone || '',
      },
      proofImageUrl: proofImageUrl || '',
      status: 'PENDING',
    });

    // Mark item status to PENDING_CLAIM
    itemReport.status = 'PENDING_CLAIM';
    await itemReport.save();

    // Notify the item reporter
    if (itemReport.reporterId.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: itemReport.reporterId,
        title: 'New Ownership Claim Submitted',
        message: `A student has submitted a verification claim for "${itemReport.itemName}". Please review the proof details.`,
        type: 'CLAIM_SUBMITTED',
        link: `/dashboard?tab=claims`,
      });
    }

    // Claimant confirmation notification
    await Notification.create({
      userId: req.user._id,
      title: 'Claim Submitted Successfully',
      message: `Your claim for "${itemReport.itemName}" is under review. You will be notified once verified.`,
      type: 'CLAIM_SUBMITTED',
      link: `/dashboard?tab=claims`,
    });

    return res.status(201).json({
      success: true,
      message: 'Claim submitted successfully. Under verification.',
      claim,
    });
  } catch (error) {
    console.error('[createClaim] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit claim',
      error: error.message,
    });
  }
};

// @desc Get current user's claims
// @route GET /api/claims/my
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id })
      .populate('itemReportId')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      claims,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your claims',
      error: error.message,
    });
  }
};

// @desc Get all claims (admin or reporter reviewing claims on their found items)
// @route GET /api/claims
const getClaims = async (req, res) => {
  try {
    const { status, itemId } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (itemId) {
      query.itemReportId = itemId;
    }

    // If not admin, restrict to claims on items reported by current user
    if (req.user.role !== 'admin') {
      const myItems = await ItemReport.find({ reporterId: req.user._id }).select('_id');
      const myItemIds = myItems.map((i) => i._id);
      query.itemReportId = { $in: myItemIds };
    }

    const claims = await Claim.find(query)
      .populate('itemReportId')
      .populate('claimantId', 'name email campusId phone')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      claims,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch claims',
      error: error.message,
    });
  }
};

// @desc Review a claim (Approve, Reject, or Complete Return)
// @route PATCH /api/claims/:id/review
const reviewClaim = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be PENDING, APPROVED, REJECTED, or COMPLETED',
      });
    }

    const claim = await Claim.findById(req.params.id).populate('itemReportId');
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    const itemReport = claim.itemReportId;
    const isReporter = itemReport && itemReport.reporterId?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only item reporter or administrator can review this claim',
      });
    }

    claim.status = status;
    claim.adminNotes = adminNotes || claim.adminNotes;
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    await claim.save();

    // If completed return
    if (status === 'COMPLETED') {
      if (itemReport) {
        itemReport.status = 'RETURNED';
        await itemReport.save();

        // Mark related matches as RESOLVED
        await Match.updateMany(
          {
            $or: [
              { lostReportId: itemReport._id },
              { foundReportId: itemReport._id },
            ],
          },
          { status: 'RESOLVED' }
        );
      }

      // Notify claimant
      await Notification.create({
        userId: claim.claimantId,
        title: 'Item Return Confirmed! 🎉',
        message: `Your recovery of "${itemReport ? itemReport.itemName : 'item'}" has been finalized! Thank you for using FindIt AI.`,
        type: 'ITEM_RETURNED',
        link: `/dashboard?tab=claims`,
      });
    } else if (status === 'APPROVED') {
      await Notification.create({
        userId: claim.claimantId,
        title: 'Claim Approved! ✅',
        message: `Your ownership claim for "${itemReport ? itemReport.itemName : 'item'}" has been approved. Please follow instructions to collect your item.`,
        type: 'CLAIM_STATUS_UPDATED',
        link: `/dashboard?tab=claims`,
      });
    } else if (status === 'REJECTED') {
      // Revert item report back to OPEN if no other approved claims
      if (itemReport) {
        itemReport.status = 'OPEN';
        await itemReport.save();
      }

      await Notification.create({
        userId: claim.claimantId,
        title: 'Claim Update: Not Verified',
        message: `Your claim for "${itemReport ? itemReport.itemName : 'item'}" could not be verified with provided details.`,
        type: 'CLAIM_STATUS_UPDATED',
        link: `/dashboard?tab=claims`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Claim status successfully updated to ${status}`,
      claim,
    });
  } catch (error) {
    console.error('[reviewClaim] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to review claim',
      error: error.message,
    });
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getClaims,
  reviewClaim,
};
