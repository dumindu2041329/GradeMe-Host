// This file serves as the entry point for Vercel serverless functions
// Set VERCEL environment variable so the server doesn't start listening
process.env.VERCEL = '1';

// Import the built server
const server = require('../dist/index.js');

// Export the Express app
// Handle both default export and direct export
module.exports = server.default || server;