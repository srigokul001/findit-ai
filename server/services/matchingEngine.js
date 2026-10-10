const Match = require('../models/Match');
const ItemReport = require('../models/ItemReport');
const Notification = require('../models/Notification');

// Campus zones for proximity matching
const CAMPUS_ZONES = {
  'Central Library': 'Academic Core',
  'Science & Tech Complex': 'Academic Core',
  'Engineering Hall': 'Academic Core',
  'Main Auditorium': 'Academic Core',
  'Student Union': 'Student Life',
  'Campus Cafeteria': 'Student Life',
  'Bookstore & Cafe': 'Student Life',
  'Sports Pavilion & Gym': 'Athletics',
  'Outdoor Stadium': 'Athletics',
  'North Dormitory Hall': 'Residential',
  'South Dormitory Hall': 'Residential',
  'West Parking Structure': 'Parking & Transit',
  'East Transit Center': 'Parking & Transit',
  'Campus Green': 'Open Grounds',
};

// Common color synonyms
const COLOR_SYNONYMS = {
  navy: ['blue', 'dark blue', 'navy blue'],
  blue: ['navy', 'cyan', 'light blue', 'dark blue'],
  gray: ['grey', 'silver', 'slate', 'charcoal'],
  grey: ['gray', 'silver', 'slate', 'charcoal'],
  silver: ['gray', 'grey', 'metallic', 'chrome'],
  black: ['dark', 'charcoal', 'matte black', 'jet black'],
  white: ['cream', 'off-white', 'ivory', 'silver'],
  red: ['crimson', 'burgundy', 'maroon'],
  gold: ['yellow', 'rose gold', 'bronze', 'champagne'],
};

// Common English stopwords to ignore in text similarity
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'it', 'is', 'was', 'my', 'i', 'this', 'that', 'there', 'has', 'have',
  'had', 'lost', 'found', 'please', 'help', 'left', 'dropped', 'item', 'one',
  'near', 'around', 'inside', 'outside', 'front', 'back', 'very', 'some',
]);

const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word));
};

const jaccardSimilarity = (setA, setB) => {
  if (setA.size === 0 && setB.size === 0) return 0;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

/**
 * Compare two item reports (one LOST and one FOUND)
 */
function calculateMatch(lost, found) {
  const reasons = [];
  const differences = [];

  // 1. Category Similarity (max 25 pts)
  let categoryScore = 0;
  if (lost.category === found.category) {
    categoryScore = 25;
    reasons.push(`Exact category match: ${lost.category}`);
  } else {
    // Compatible categories
    const compatibleGroups = [
      ['Electronics', 'Accessories'],
      ['Wallets', 'Bags'],
      ['Accessories', 'Clothing'],
    ];
    const isCompatible = compatibleGroups.some(
      (group) => group.includes(lost.category) && group.includes(found.category)
    );
    if (isCompatible) {
      categoryScore = 12;
      reasons.push(`Related category match: ${lost.category} / ${found.category}`);
    } else {
      categoryScore = 0;
      differences.push(`Different categories: Lost is ${lost.category}, Found is ${found.category}`);
    }
  }

  // 2. Name & Brand Similarity (max 25 pts)
  let nameBrandScore = 0;
  const lostNameTokens = new Set(tokenize(lost.itemName));
  const foundNameTokens = new Set(tokenize(found.itemName));
  const nameSim = jaccardSimilarity(lostNameTokens, foundNameTokens);

  let brandMatch = false;
  if (lost.brand && found.brand) {
    const lBrand = lost.brand.trim().toLowerCase();
    const fBrand = found.brand.trim().toLowerCase();
    if (lBrand === fBrand) {
      brandMatch = true;
      nameBrandScore += 12;
      reasons.push(`Brand matched: ${lost.brand}`);
    } else if (lBrand.includes(fBrand) || fBrand.includes(lBrand)) {
      brandMatch = true;
      nameBrandScore += 8;
      reasons.push(`Brand similarity: ${lost.brand} ~ ${found.brand}`);
    } else {
      differences.push(`Different brands: ${lost.brand} vs ${found.brand}`);
    }
  } else if (lost.brand && !found.brand) {
    // Check if lost brand appears in found item name or description
    const lBrand = lost.brand.trim().toLowerCase();
    if (found.itemName.toLowerCase().includes(lBrand) || found.description.toLowerCase().includes(lBrand)) {
      nameBrandScore += 10;
      reasons.push(`Brand '${lost.brand}' detected in found item details`);
      brandMatch = true;
    }
  } else if (!lost.brand && found.brand) {
    const fBrand = found.brand.trim().toLowerCase();
    if (lost.itemName.toLowerCase().includes(fBrand) || lost.description.toLowerCase().includes(fBrand)) {
      nameBrandScore += 10;
      reasons.push(`Brand '${found.brand}' detected in lost item details`);
      brandMatch = true;
    }
  }

  // Name tokens scoring (up to 13 points if brand scored, or up to 25 if no brand)
  const maxNameTokensScore = brandMatch ? 13 : 25;
  const tokenScore = Math.round(nameSim * maxNameTokensScore);
  nameBrandScore += tokenScore;

  if (nameSim > 0.4) {
    const sharedTokens = [...lostNameTokens].filter((t) => foundNameTokens.has(t));
    if (sharedTokens.length > 0) {
      reasons.push(`Strong name keyword match: "${sharedTokens.slice(0, 3).join(', ')}"`);
    }
  } else if (nameSim === 0 && !brandMatch) {
    differences.push(`Item names differ significantly: "${lost.itemName}" vs "${found.itemName}"`);
  }
  nameBrandScore = Math.min(25, nameBrandScore);

  // 3. Color Similarity (max 15 pts)
  let colorScore = 0;
  if (lost.color && found.color) {
    const lColor = lost.color.trim().toLowerCase();
    const fColor = found.color.trim().toLowerCase();

    if (lColor === fColor) {
      colorScore = 15;
      reasons.push(`Identical color: ${lost.color}`);
    } else {
      const syns = COLOR_SYNONYMS[lColor] || [];
      if (syns.includes(fColor)) {
        colorScore = 12;
        reasons.push(`Complementary color match: ${lost.color} / ${found.color}`);
      } else {
        differences.push(`Different color: ${lost.color} vs ${found.color}`);
      }
    }
  } else if (lost.color || found.color) {
    const presentColor = (lost.color || found.color).trim().toLowerCase();
    const otherText = (lost.color ? found.description + ' ' + found.itemName : lost.description + ' ' + lost.itemName).toLowerCase();
    if (otherText.includes(presentColor)) {
      colorScore = 10;
      reasons.push(`Color '${presentColor}' mentioned in matching report`);
    } else {
      colorScore = 5; // Neutral
    }
  } else {
    colorScore = 7; // Neutral if both unspecified
  }

  // 4. Description Keyword Similarity (max 15 pts)
  const lostDescTokens = new Set(tokenize(lost.description));
  const foundDescTokens = new Set(tokenize(found.description));
  const descSim = jaccardSimilarity(lostDescTokens, foundDescTokens);
  const descriptionScore = Math.min(15, Math.round(descSim * 30));

  if (descSim > 0.15) {
    const sharedDesc = [...lostDescTokens].filter((t) => foundDescTokens.has(t));
    if (sharedDesc.length > 0) {
      reasons.push(`Shared description attributes: ${sharedDesc.slice(0, 3).join(', ')}`);
    }
  }

  // 5. Campus Location Proximity (max 10 pts)
  let locationScore = 0;
  if (lost.location === found.location) {
    locationScore = 10;
    reasons.push(`Exact location match: ${lost.location}`);
  } else {
    const lostZone = CAMPUS_ZONES[lost.location];
    const foundZone = CAMPUS_ZONES[found.location];
    if (lostZone && foundZone && lostZone === foundZone) {
      locationScore = 6;
      reasons.push(`Same campus zone (${lostZone}): ${lost.location} ~ ${found.location}`);
    } else {
      locationScore = 2;
      differences.push(`Different locations: ${lost.location} vs ${found.location}`);
    }
  }

  // 6. Date Proximity (max 10 pts)
  let dateScore = 0;
  const lostTime = new Date(lost.reportDate).getTime();
  const foundTime = new Date(found.reportDate).getTime();
  const diffDays = (foundTime - lostTime) / (1000 * 60 * 60 * 24);

  if (diffDays >= -1 && diffDays <= 3) {
    // Found within 3 days after being lost (or 1 day margin for report time difference)
    dateScore = 10;
    reasons.push(`Timeline aligned: reported within ${Math.max(1, Math.round(Math.abs(diffDays)))} day(s) of each other`);
  } else if (diffDays > 3 && diffDays <= 7) {
    dateScore = 8;
    reasons.push(`Timeline match: found within 1 week of reported loss`);
  } else if (diffDays > 7 && diffDays <= 21) {
    dateScore = 5;
    reasons.push(`Timeline plausibility: found within 3 weeks of loss`);
  } else if (diffDays < -1) {
    // Found well before lost date - unlikely unless report date was misremembered
    dateScore = 1;
    differences.push(`Timeline mismatch: item marked found before reported lost date`);
  } else {
    dateScore = 2;
  }

  // Calculate final weighted total score (0 - 100)
  const totalScore = Math.min(
    100,
    Math.max(0, categoryScore + nameBrandScore + colorScore + descriptionScore + locationScore + dateScore)
  );

  return {
    score: totalScore,
    breakdown: {
      categoryScore,
      nameBrandScore,
      colorScore,
      descriptionScore,
      locationScore,
      dateScore,
    },
    matchingReasons: reasons,
    differences,
  };
}

/**
 * Run matching for a newly created or updated report against all opposing reports
 */
async function processReportMatches(report) {
  try {
    const isLost = report.reportType === 'LOST';
    const targetType = isLost ? 'FOUND' : 'LOST';

    // Find all active opposing reports
    const opposingReports = await ItemReport.find({
      reportType: targetType,
      status: { $in: ['OPEN', 'PENDING_CLAIM'] },
      _id: { $ne: report._id },
    }).populate('reporterId', 'name email');

    const generatedMatches = [];

    for (const opp of opposingReports) {
      const lostItem = isLost ? report : opp;
      const foundItem = isLost ? opp : report;

      const { score, breakdown, matchingReasons, differences } = calculateMatch(lostItem, foundItem);

      // Only record matches with meaningful score (threshold: 30%)
      if (score >= 30) {
        const matchRecord = await Match.findOneAndUpdate(
          { lostReportId: lostItem._id, foundReportId: foundItem._id },
          {
            lostReportId: lostItem._id,
            foundReportId: foundItem._id,
            score,
            breakdown,
            matchingReasons,
            differences,
            status: 'POTENTIAL',
          },
          { upsert: true, new: true }
        );

        generatedMatches.push(matchRecord);

        // Notify both parties if match score is high (>= 60)
        if (score >= 60) {
          const recipientId = isLost ? report.reporterId : opp.reporterId;
          const otherItemName = isLost ? opp.itemName : report.itemName;

          // Check if notification already sent for this pair
          const existingNotif = await Notification.findOne({
            userId: recipientId,
            link: `/matches/${matchRecord._id}`,
          });

          if (!existingNotif) {
            await Notification.create({
              userId: recipientId,
              title: `Potential Match Detected (${score}%)!`,
              message: `We found a ${score}% similarity match with "${otherItemName}". Review details now!`,
              type: 'MATCH_FOUND',
              link: `/matches/${matchRecord._id}`,
            });
          }
        }
      }
    }

    return generatedMatches;
  } catch (err) {
    console.error('[MatchingEngine] Error processing report matches:', err);
    return [];
  }
}

/**
 * Re-run full match matrix across all open reports (used in seed or maintenance)
 */
async function runFullMatchEngine() {
  const lostReports = await ItemReport.find({ reportType: 'LOST', status: 'OPEN' });
  const foundReports = await ItemReport.find({ reportType: 'FOUND', status: 'OPEN' });

  let count = 0;
  for (const lost of lostReports) {
    for (const found of foundReports) {
      const { score, breakdown, matchingReasons, differences } = calculateMatch(lost, found);
      if (score >= 30) {
        await Match.findOneAndUpdate(
          { lostReportId: lost._id, foundReportId: found._id },
          {
            lostReportId: lost._id,
            foundReportId: found._id,
            score,
            breakdown,
            matchingReasons,
            differences,
            status: 'POTENTIAL',
          },
          { upsert: true }
        );
        count++;
      }
    }
  }
  return count;
}

module.exports = {
  calculateMatch,
  processReportMatches,
  runFullMatchEngine,
};
