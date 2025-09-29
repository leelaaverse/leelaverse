import { z } from 'zod';

// Auth schemas
export const registerSchema = {
  body: z.object({
    email: z.string().email('Invalid email format'),
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z.string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters'),
    fullName: z.string()
      .min(1, 'Full name is required')
      .max(100, 'Full name must be less than 100 characters'),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
};

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters'),
  }),
};

// User schemas
export const updateProfileSchema = {
  body: z.object({
    fullName: z.string()
      .min(1, 'Full name is required')
      .max(100, 'Full name must be less than 100 characters')
      .optional(),
    bio: z.string()
      .max(500, 'Bio must be less than 500 characters')
      .optional(),
    location: z.string()
      .max(100, 'Location must be less than 100 characters')
      .optional(),
    website: z.string()
      .url('Invalid website URL')
      .optional()
      .or(z.literal('')),
    dateOfBirth: z.string()
      .datetime('Invalid date format')
      .optional(),
  }),
};

export const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(6, 'New password must be at least 6 characters')
      .max(100, 'New password must be less than 100 characters'),
  }),
};

// Post schemas
export const createPostSchema = {
  body: z.object({
    content: z.string()
      .min(1, 'Post content is required')
      .max(2000, 'Post content must be less than 2000 characters'),
    imageUrl: z.string().url('Invalid image URL').optional(),
    type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO']).default('TEXT'),
    tags: z.array(z.string()).optional(),
  }),
};

export const updatePostSchema = {
  body: z.object({
    content: z.string()
      .min(1, 'Post content is required')
      .max(2000, 'Post content must be less than 2000 characters')
      .optional(),
    tags: z.array(z.string()).optional(),
  }),
};

export const createCommentSchema = {
  body: z.object({
    content: z.string()
      .min(1, 'Comment content is required')
      .max(500, 'Comment content must be less than 500 characters'),
  }),
};

// Common parameter schemas
export const idParamSchema = {
  params: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),
};

export const paginationSchema = {
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .refine(val => val > 0, 'Page must be greater than 0')
      .optional()
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .optional()
      .default('20'),
  }),
};

export const searchSchema = {
  query: z.object({
    q: z.string()
      .min(1, 'Search query is required')
      .max(100, 'Search query must be less than 100 characters'),
    type: z.enum(['users', 'posts']).optional(),
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .refine(val => val > 0, 'Page must be greater than 0')
      .optional()
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .optional()
      .default('20'),
  }),
};
