import express from 'express';
import { registerRoutes } from '../server/routes';
import { createTablesIfNotExist } from '../server/create-tables';
import { migrateStudentsToUsers } from '../server/migrate-students';
import { setupInitialData } from '../server/setup-database';
import { cleanupExtraBuckets } from '../server/cleanup-buckets';
import { profileImageStorage } from '../server/profile-image-storage';
import { paperFileStorage } from '../server/paper-file-storage';
import { runPasswordResetMigration } from '../server/run-password-reset-migration';
import session from 'express-session';
import cors from 'cors';

const app = express();

// Configure CORS for Vercel
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize database and setup
async function initializeApp() {
  try {
    console.log('Initializing database...');
    await createTablesIfNotExist();
    
    console.log('Setting up storage buckets...');
    await profileImageStorage.createBucketManually();
    await paperFileStorage.createBucketManually();
    
    console.log('Running migrations...');
    await migrateStudentsToUsers();
    await runPasswordResetMigration();
    
    console.log('Cleaning up extra buckets...');
    await cleanupExtraBuckets();
    
    console.log('Setting up initial data...');
    await setupInitialData();
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error during initialization:', error);
  }
}

// Initialize on first run (only in development)
if (process.env.NODE_ENV !== 'production') {
  initializeApp();
}

// Register routes
registerRoutes(app);

export default app;