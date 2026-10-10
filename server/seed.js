require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('./config/db');
const User = require('./models/User');
const ItemReport = require('./models/ItemReport');
const Match = require('./models/Match');
const Claim = require('./models/Claim');
const Notification = require('./models/Notification');
const { runFullMatchEngine } = require('./services/matchingEngine');

const seedData = async (disconnectAfter = false) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Connecting to database...');
      await connectDB();
    }

    console.log('[Seed] Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      ItemReport.deleteMany({}),
      Match.deleteMany({}),
      Claim.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const studentPass = await bcrypt.hash('student123', salt);

    const admin = await User.create({
      name: 'Campus Admin',
      email: 'admin@campus.edu',
      passwordHash: adminPass,
      role: 'admin',
      campusId: 'STAFF-9001',
      phone: '+1 (555) 019-2831',
    });

    const alex = await User.create({
      name: 'Alex Johnson',
      email: 'alex@campus.edu',
      passwordHash: studentPass,
      role: 'student',
      campusId: 'STU-2024-0418',
      phone: '+1 (555) 014-9921',
    });

    const sarah = await User.create({
      name: 'Sarah Miller',
      email: 'sarah@campus.edu',
      passwordHash: studentPass,
      role: 'student',
      campusId: 'STU-2023-1102',
      phone: '+1 (555) 017-3382',
    });

    const marcus = await User.create({
      name: 'Marcus Chen',
      email: 'marcus@campus.edu',
      passwordHash: studentPass,
      role: 'student',
      campusId: 'STU-2024-8834',
      phone: '+1 (555) 018-4491',
    });

    const priya = await User.create({
      name: 'Priya Sharma',
      email: 'priya@campus.edu',
      passwordHash: studentPass,
      role: 'student',
      campusId: 'STU-2025-5021',
      phone: '+1 (555) 012-7719',
    });

    console.log('[Seed] Creating lost & found item reports...');
    const now = new Date();
    const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Reports array
    const reports = [
      // 1. Alex lost iPhone 14 Pro
      {
        reporterId: alex._id,
        reportType: 'LOST',
        itemName: 'Apple iPhone 14 Pro (Space Black)',
        category: 'Electronics',
        brand: 'Apple',
        color: 'Space Black',
        description: 'Lost my iPhone 14 Pro near the 2nd floor silent study carrels. Black silicone case with a tiny NASA sticker on the bottom back. Screen protector has a tiny crack top-right.',
        reportDate: daysAgo(3),
        location: 'Central Library',
        specificLocation: '2nd Floor Carrel 24 near science stacks',
        identifyingDetails: 'Lock screen wallpaper is an orange cat with astronaut helmet. Passcode begins with 90. IMEI ends in 4921.',
        contactPreference: 'in-app',
        imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
        status: 'OPEN',
      },
      // 2. Sarah found iPhone 14
      {
        reporterId: sarah._id,
        reportType: 'FOUND',
        itemName: 'iPhone 14 with Black Case',
        category: 'Electronics',
        brand: 'Apple',
        color: 'Black',
        description: 'Found a black iPhone with protective bumper case on desk 18 in Central Library quiet area. Clean condition with sticker on back.',
        reportDate: daysAgo(2),
        location: 'Central Library',
        specificLocation: 'Library 2nd floor study area table 18',
        storageLocation: 'Central Library Front Circulation Desk',
        imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
        status: 'OPEN',
      },
      // 3. Marcus lost AirPods Pro 2
      {
        reporterId: marcus._id,
        reportType: 'LOST',
        itemName: 'AirPods Pro 2nd Gen',
        category: 'Electronics',
        brand: 'Apple',
        color: 'White',
        description: 'Accidentally left my AirPods Pro 2 charging case on a low table near the coffee shop. The case is inside a light blue silicone sleeve with an aluminum carabiner clip.',
        reportDate: daysAgo(4),
        location: 'Student Union',
        specificLocation: 'Lounge couch across from Campus Coffee counter',
        identifyingDetails: 'Laser engraved on the front under the LED: "MC-2024". Left earbud has small medium foam tip.',
        contactPreference: 'email',
        imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
        status: 'OPEN',
      },
      // 4. Priya found AirPods in blue sleeve
      {
        reporterId: priya._id,
        reportType: 'FOUND',
        itemName: 'Apple AirPods in Blue Silicone Case',
        category: 'Electronics',
        brand: 'Apple',
        color: 'White',
        description: 'Found a white wireless earbuds charging case inside a light blue silicone protective skin with metal clip on coffee table.',
        reportDate: daysAgo(3),
        location: 'Student Union',
        specificLocation: 'Coffee bar seating area',
        storageLocation: 'Student Union Information & Security Desk',
        imageUrl: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&auto=format&fit=crop&q=80',
        status: 'OPEN',
      },
      // 5. Alex lost Brown Leather Fossil Wallet
      {
        reporterId: alex._id,
        reportType: 'LOST',
        itemName: 'Brown Leather Fossil Bifold Wallet',
        category: 'Wallets',
        brand: 'Fossil',
        color: 'Brown',
        description: 'Lost dark brown leather bifold wallet during 12:30pm lunch rush. Has student ID, bus card, and debit card.',
        reportDate: daysAgo(5),
        location: 'Campus Cafeteria',
        specificLocation: 'Near tray return station by east exit doors',
        identifyingDetails: 'Contains student ID card #STU-2024-0418 for Alex Johnson and expired gym pass.',
        contactPreference: 'in-app',
        imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
        status: 'OPEN',
      },
      // 6. Marcus found Brown Leather Wallet
      {
        reporterId: marcus._id,
        reportType: 'FOUND',
        itemName: 'Men’s Brown Leather Wallet',
        category: 'Wallets',
        brand: 'Fossil',
        color: 'Brown',
        description: 'Found genuine brown leather wallet left on cafeteria tray rack. Turned over to campus security with all cards intact.',
        reportDate: daysAgo(5),
        location: 'Campus Cafeteria',
        specificLocation: 'Tray deposit rack',
        storageLocation: 'Campus Security Headquarters, Office 104',
        imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
        status: 'OPEN',
      },
      // 7. Sarah lost North Face Backpack
      {
        reporterId: sarah._id,
        reportType: 'LOST',
        itemName: 'The North Face Recon Backpack (Navy Blue)',
        category: 'Bags',
        brand: 'The North Face',
        color: 'Navy Blue',
        description: 'Left my navy blue North Face daypack in lecture auditorium after Organic Chemistry. Contains notebooks, pencil pouch, and laptop charger.',
        reportDate: daysAgo(2),
        location: 'Science & Tech Complex',
        specificLocation: 'Lecture Hall 101 row F seat 12',
        identifyingDetails: 'Chemistry spiral notebook has name Sarah M inside cover. Small keychain attached to zipper with yellow ribbon.',
        contactPreference: 'phone',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
        status: 'OPEN',
      },
      // 8. Priya found Navy Blue Daypack
      {
        reporterId: priya._id,
        reportType: 'FOUND',
        itemName: 'Navy North Face Daypack',
        category: 'Bags',
        brand: 'The North Face',
        color: 'Navy',
        description: 'Found dark blue backpack under seat in Science lecture hall 101. Handed to department coordinator.',
        reportDate: daysAgo(1),
        location: 'Science & Tech Complex',
        specificLocation: 'Lecture Hall 101',
        storageLocation: 'Chemistry Dept Administrative Office',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
        status: 'OPEN',
      },
      // 9. Lost Keys
      {
        reporterId: marcus._id,
        reportType: 'LOST',
        itemName: 'Dorm Keys on Sonic the Hedgehog Lanyard',
        category: 'Keys',
        brand: 'Other',
        color: 'Silver',
        description: 'Set of 3 brass and silver dorm keys on a blue Sonic the Hedgehog cloth lanyard with metal carabiner.',
        reportDate: daysAgo(6),
        location: 'North Dormitory Hall',
        specificLocation: 'Courtyard walkway between Tower A and B',
        identifyingDetails: 'One key has green rubber cap. Room number stamped on key: 314.',
        contactPreference: 'in-app',
        imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
        status: 'OPEN',
      },
      // 10. Found Water Bottle
      {
        reporterId: sarah._id,
        reportType: 'FOUND',
        itemName: 'Hydro Flask 32oz Teal Bottle',
        category: 'Accessories',
        brand: 'Hydro Flask',
        color: 'Teal',
        description: 'Wide mouth Hydro Flask with flex straw cap. Has mountain stickers and national park badge.',
        reportDate: daysAgo(1),
        location: 'Sports Pavilion & Gym',
        specificLocation: 'Bleachers near basketball court 2',
        storageLocation: 'Gym Front Reception Desk',
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
        status: 'OPEN',
      },
      // 11. Lost Casio Calculator
      {
        reporterId: priya._id,
        reportType: 'LOST',
        itemName: 'Casio fx-991EX ClassWiz Scientific Calculator',
        category: 'Electronics',
        brand: 'Casio',
        color: 'Black',
        description: 'Scientific calculator with white sliding hard case. Lost during calculus exam review.',
        reportDate: daysAgo(7),
        location: 'Engineering Hall',
        specificLocation: 'Room 205 study room',
        identifyingDetails: 'Small scratch near solar cell, battery compartment has blue tape mark.',
        contactPreference: 'in-app',
        imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
        status: 'OPEN',
      },
      // 12. Returned item (Resolved demo)
      {
        reporterId: alex._id,
        reportType: 'FOUND',
        itemName: 'Student ID Card (Priya S.)',
        category: 'ID Cards',
        brand: 'Campus ID',
        color: 'Blue',
        description: 'Found college student ID card on lawn near library fountain.',
        reportDate: daysAgo(10),
        location: 'Campus Green',
        specificLocation: 'Fountain bench',
        storageLocation: 'Returned to student directly',
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        status: 'RETURNED',
      },
    ];

    const createdReports = await ItemReport.insertMany(reports);
    console.log(`[Seed] Inserted ${createdReports.length} item reports.`);

    console.log('[Seed] Running Smart Matching Engine across all reports...');
    const matchCount = await runFullMatchEngine();
    console.log(`[Seed] Smart Matching Engine created ${matchCount} scored match pairs!`);

    // Create 1 sample active claim for testing
    const foundPhoneReport = createdReports.find(
      (r) => r.reportType === 'FOUND' && r.itemName.includes('iPhone 14')
    );

    if (foundPhoneReport) {
      console.log('[Seed] Creating sample claim for found iPhone...');
      const sampleClaim = await Claim.create({
        itemReportId: foundPhoneReport._id,
        claimantId: alex._id,
        privateVerificationDetails: 'I can confirm the lock screen is an orange cat in a space suit. The screen passcode is 902144. Back has a circular NASA sticker.',
        claimReason: 'I was studying at Table 24 on Tuesday afternoon and left it when rushing to chemistry lab.',
        contactInfo: {
          email: alex.email,
          phone: alex.phone,
        },
        status: 'PENDING',
      });

      // Update item status to PENDING_CLAIM
      foundPhoneReport.status = 'PENDING_CLAIM';
      await foundPhoneReport.save();

      // Notifications
      await Notification.create({
        userId: sarah._id,
        title: 'New Claim Received for Found Item',
        message: `Alex Johnson submitted an ownership claim for "${foundPhoneReport.itemName}". Check proof verification details in your dashboard.`,
        type: 'CLAIM_SUBMITTED',
        link: `/dashboard?tab=claims`,
      });

      await Notification.create({
        userId: alex._id,
        title: 'Claim Submitted (Under Review)',
        message: `Your claim for "${foundPhoneReport.itemName}" has been received and is awaiting finder or admin verification.`,
        type: 'CLAIM_SUBMITTED',
        link: `/dashboard?tab=claims`,
      });
    }

    // Add high match notification
    const topMatch = await Match.findOne({ score: { $gte: 75 } })
      .populate('lostReportId')
      .populate('foundReportId');

    if (topMatch && topMatch.lostReportId) {
      await Notification.create({
        userId: topMatch.lostReportId.reporterId,
        title: `High Probability Match Detected (${topMatch.score}%)!`,
        message: `FindIt AI matched your lost "${topMatch.lostReportId.itemName}" with a found item reported at ${topMatch.foundReportId.location}.`,
        type: 'MATCH_FOUND',
        link: `/matches/${topMatch._id}`,
      });
    }

    console.log('========================================================');
    console.log('✅ SEEDING COMPLETE! Test Accounts Ready:');
    console.log('🔑 Administrator: admin@campus.edu  / password: admin123');
    console.log('🎓 Student 1:     alex@campus.edu   / password: student123');
    console.log('🎓 Student 2:     sarah@campus.edu  / password: student123');
    console.log('🎓 Student 3:     marcus@campus.edu / password: student123');
    console.log('🎓 Student 4:     priya@campus.edu  / password: student123');
    console.log('========================================================');

    if (disconnectAfter) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    if (disconnectAfter) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = { seedData };

