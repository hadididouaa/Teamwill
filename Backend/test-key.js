// test-key.js
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Test avec fichier
const keyFromFile = fs.readFileSync(path.join(__dirname, 'config', 'jitsi.key'), 'utf8');
console.log('Key from file valid:', testKey(keyFromFile));

// Test avec environnement
const keyFromEnv = process.env.JITSI_JWT_SECRET.replace(/\\n/g, '\n').trim();
console.log('Key from env valid:', testKey(keyFromEnv));

function testKey(key) {
  try {
    const token = jwt.sign({ test: 'payload' }, key, { algorithm: 'RS256' });
    return !!token;
  } catch (e) {
    console.error('Key test failed:', e.message);
    return false;
  }
}