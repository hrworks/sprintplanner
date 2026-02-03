import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  googleId: text('google_id').unique(),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  status: text('status', { enum: ['pending', 'active'] }).notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const userSettings = sqliteTable('user_settings', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  showMyCursor: integer('show_my_cursor', { mode: 'boolean' }).notNull().default(true),
  showOtherCursors: integer('show_other_cursors', { mode: 'boolean' }).notNull().default(true),
});

export const boards = sqliteTable('boards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  data: text('data').notNull().default('{"projects":[],"connections":[]}'),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const boardMembers = sqliteTable('board_members', {
  id: text('id').primaryKey(),
  boardId: text('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  invitedEmail: text('invited_email').notNull(),
  role: text('role', { enum: ['owner', 'editor', 'viewer'] }).notNull().default('viewer'),
  inviteToken: text('invite_token'),
  invitedAt: integer('invited_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  acceptedAt: integer('accepted_at', { mode: 'timestamp' }),
});
