const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[DB] Attempting connection to configured MongoDB URI...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`[DB] Successfully connected to MongoDB: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`[DB] Could not connect to configured MONGODB_URI (${err.message}). Falling back to Embedded In-Memory MongoDB.`);
    }
  }

  // Fallback to MongoMemoryServer
  try {
    console.log(`[DB] Starting Embedded MongoDB Server (Zero-config development mode)...`);
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'findit_ai_db'
      }
    });
    const memoryUri = mongodInstance.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[DB] Embedded MongoDB Server active at: ${memoryUri}`);
    console.log(`[DB] Database is fully operational for all operations (CRUD, indexing, relations).`);
  } catch (error) {
    console.error(`[DB] Fatal error initializing database:`, error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
