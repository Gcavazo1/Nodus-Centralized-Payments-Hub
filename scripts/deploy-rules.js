const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Deploying Firestore rules...');

try {
  // Execute Firebase deploy command for Firestore rules
  const output = execSync('firebase deploy --only firestore:rules', { encoding: 'utf8' });
  console.log(output);
  console.log('Firestore rules deployed successfully!');
} catch (error) {
  console.error('Error deploying Firestore rules:', error.message);
  process.exit(1);
} 