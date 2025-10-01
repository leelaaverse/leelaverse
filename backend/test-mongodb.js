#!/usr/bin/env node

/**
 * MongoDB Connection Test Script
 * Tests if MongoDB connection string works
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('\n🔍 MongoDB Connection Test\n');
console.log('================================');

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.log('\n💡 Make sure you have a .env file with MONGODB_URI set');
    process.exit(1);
}

console.log('📡 Attempting to connect to MongoDB...');
console.log(`🔗 URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
console.log('');

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
    .then(() => {
        console.log('✅ SUCCESS! Connected to MongoDB');
        console.log(`📊 Connection State: ${mongoose.connection.readyState}`);
        console.log(`🏷️  Database Name: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}`);
        console.log('');
        console.log('✨ Your MongoDB connection is working correctly!');
        console.log('');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ FAILED to connect to MongoDB\n');
        console.error('Error Details:');
        console.error('─────────────────────────────────────');
        console.error(error.message);
        console.error('');

        if (error.message.includes('IP') || error.message.includes('whitelist')) {
            console.log('💡 Solution:');
            console.log('  1. Go to MongoDB Atlas → Network Access');
            console.log('  2. Add IP Address: 0.0.0.0/0 (allow all)');
            console.log('  3. Or whitelist your current IP address');
        } else if (error.message.includes('authentication') || error.message.includes('credentials')) {
            console.log('💡 Solution:');
            console.log('  1. Check your MongoDB username and password');
            console.log('  2. Ensure user has correct permissions');
            console.log('  3. Update MONGODB_URI in .env file');
        } else {
            console.log('💡 Possible Solutions:');
            console.log('  1. Check if MongoDB Atlas cluster is running');
            console.log('  2. Verify connection string format');
            console.log('  3. Check network connectivity');
        }

        console.log('');
        process.exit(1);
    });

// Handle connection events
mongoose.connection.on('error', (err) => {
    console.error('⚠️  MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('📴 MongoDB disconnected');
});
