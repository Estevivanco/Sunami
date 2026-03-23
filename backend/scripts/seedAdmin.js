import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';
import User from '../models/User.js';

// Ladda miljövariabler
dotenv.config();

/**
 * Generate a secure random password
 */
const generateSecurePassword = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Script to create an admin user from environment variables
 * Run with: node scripts/seedAdmin.js
 */
const seedAdmin = async () => {
  try {
    // Anslut till MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Hämta admin-referenser från miljövariabler
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminEmail = process.env.ADMIN_EMAIL;
    let adminPassword = process.env.ADMIN_PASSWORD;

    // Validera miljövariabler
    if (!adminUsername || !adminEmail) {
      console.error('Error: Missing admin credentials in .env file');
      console.error('Required: ADMIN_USERNAME, ADMIN_EMAIL');
      console.error('Optional: ADMIN_PASSWORD (will be auto-generated if missing)');
      process.exit(1);
    }

    // Generera säkert lösenord om det inte är angivet
    if (!adminPassword) {
      adminPassword = generateSecurePassword();
      console.log('⚠️  No ADMIN_PASSWORD in .env - generated secure password:');
      console.log(`📋 Password: ${adminPassword}`);
      console.log('⚠️  Save this password! Add to .env: ADMIN_PASSWORD=${adminPassword}\n');
    }

    // Kontrollera om admin redan existerar
    const existingAdmin = await User.findOne({
      $or: [
        { email: adminEmail.toLowerCase() },
        { username: adminUsername }
      ]
    });

    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`  Username: ${existingAdmin.username}`);
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Role: ${existingAdmin.role}`);
      
      // Uppdatera till admin om inte redan
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ User updated to admin role');
      } else {
        console.log('ℹ️  User already has admin role');
      }
    } else {
      // Skapa ny admin-användare
      const admin = new User({
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });

      await admin.save();
      console.log('✅ Admin user created successfully:');
      console.log(`  Username: ${admin.username}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Role: ${admin.role}`);
    }

    // Koppla från MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

// Run the script
seedAdmin();
