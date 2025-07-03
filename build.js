#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Build the frontend
  console.log('📦 Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Check if build was successful
  const distPath = path.join(process.cwd(), 'client', 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Frontend build completed successfully');
  } else {
    throw new Error('Frontend build failed - dist directory not found');
  }

  console.log('🎉 Build process completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}