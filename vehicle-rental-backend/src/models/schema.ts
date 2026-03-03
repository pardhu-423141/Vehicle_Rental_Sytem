import { pgTable, uuid, text, varchar, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

// 1. Define the User Roles as a Postgres Enum
export const roleEnum = pgEnum('role', ['USER', 'USER_MANAGER', 'VEHICLE_MANAGER', 'ADMIN']);
export const kycEnum = pgEnum('kyc_status', ['PENDING', 'APPROVED', 'REJECTED']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(), // This will store the hashed password
  role: roleEnum('role').default('USER').notNull(),
  kycStatus: kycEnum('kyc_status').default('PENDING').notNull(),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});