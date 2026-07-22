/**
 * One-time seed script — creates the first admin user.
 *
 * Usage:
 *   npx ts-node src/scripts/seedAdmin.ts
 *
 * Edit the values below before running.
 */

import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { sequelize } from '../models/index';
import { User } from '../models/index';

async function seed() {
  try {
    await sequelize.authenticate();
    // Sync only the users table (non-destructive)
    await sequelize.sync({ alter: false });

    const name = 'System Admin';
    const email = 'admin@school.com';
    const password = 'Admin@1234';   // ← change this
    const role = 'admin' as const;

    const existing = await (User as any).unscoped().findOne({ where: { email } });
    if (existing) {
      console.log(`Admin already exists: ${email}`);
      process.exit(0);
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await (User as any).unscoped().create({ name, email, password_hash, role });

    console.log('✅ Admin created successfully:');
    console.log(`   ID    : ${user.id}`);
    console.log(`   Name  : ${user.name}`);
    console.log(`   Email : ${user.email}`);
    console.log(`   Role  : ${user.role}`);
    console.log(`   Pass  : ${password}  ← save this, it won't be shown again`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
