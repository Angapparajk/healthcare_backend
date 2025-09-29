#!/usr/bin/env node

/**
 * Email Validation Testing Script
 * Usage: node test-email.js email@example.com
 */

require('dotenv').config();
const emailValidation = require('./middleware/emailValidation');

const email = process.argv[2];

if (!email) {
  console.log('Usage: node test-email.js email@example.com');
  process.exit(1);
}

console.log(`\n🔍 Testing email: ${email}\n`);

// Mock request/response objects
const req = { body: { email } };
const res = { 
  status: (code) => ({ 
    json: (msg) => {
      console.log(`❌ REJECTED (${code}): ${msg.message}`);
      process.exit(1);
    }
  }),
  json: (msg) => {
    console.log(`❌ REJECTED: ${msg.message}`);
    process.exit(1);
  }
};
const next = () => {
  console.log('✅ ACCEPTED: Email validation passed!');
  process.exit(0);
};

// Run the validation
emailValidation(req, res, next).catch(error => {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
});