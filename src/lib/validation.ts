import { z } from 'zod';

// Password regex patterns
const passwordPatterns = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/
};

// Common error messages
const errorMessages = {
  email: 'Please enter a valid email address',
  password: {
    minLength: 'Password must be at least 8 characters long',
    uppercase: 'Password must contain at least one uppercase letter',
    lowercase: 'Password must contain at least one lowercase letter',
    number: 'Password must contain at least one number',
    special: 'Password must contain at least one special character'
  },
  orgName: 'Organization name must be between 2 and 100 characters',
  name: 'Name must be between 1 and 50 characters'
};

// Registration validation schema
export const registerSchema = z.object({
  firstName: z.string()
    .min(1, errorMessages.name)
    .max(50, errorMessages.name)
    .trim(),
  lastName: z.string()
    .max(50, errorMessages.name)
    .trim()
    .optional(),
  email: z.string()
    .email(errorMessages.email)
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(8, errorMessages.password.minLength)
    .regex(passwordPatterns.uppercase, errorMessages.password.uppercase)
    .regex(passwordPatterns.lowercase, errorMessages.password.lowercase)
    .regex(passwordPatterns.number, errorMessages.password.number)
    .regex(passwordPatterns.special, errorMessages.password.special)
});

// Organization creation validation schema
export const createOrganizationSchema = z.object({
  orgName: z.string()
    .min(2, errorMessages.orgName)
    .max(100, errorMessages.orgName)
    .trim()
});

// Join organization validation schema
export const joinOrganizationSchema = z.object({
  inviteToken: z.string()
    .min(1, 'Invite token is required')
    .trim()
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string()
    .email(errorMessages.email)
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required')
});

// Site creation/update schema
export const siteSchema = z.object({
  name: z.string()
    .min(1, 'Site name is required')
    .max(100, 'Site name must be less than 100 characters')
    .trim()
});

// Room creation/update schema
export const roomSchema = z.object({
  name: z.string()
    .min(1, 'Room name is required')
    .max(100, 'Room name must be less than 100 characters')
    .trim(),
  building: z.string()
    .max(10, 'Building identifier must be less than 10 characters')
    .trim()
    .optional(),
  floor: z.number()
    .int()
    .min(0, 'Floor must be 0 or higher')
    .max(100, 'Floor must be less than 100')
    .optional()
});

// Asset creation/update schema
export const assetSchema = z.object({
  name: z.string()
    .min(1, 'Asset name is required')
    .max(100, 'Asset name must be less than 100 characters')
    .trim(),
  roomId: z.string()
    .min(1, 'Please select a room')
    .cuid('Invalid room selection')
});

// Work order creation/update schema
export const workOrderSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters')
    .trim(),
  assetId: z.string()
    .min(1, 'Please select an asset')
    .cuid('Invalid asset selection')
    .optional(),
  assignedToId: z.string()
    .cuid('Invalid user selection')
    .optional(),
  revisitSchedule: z.string()
    .datetime('Invalid date format')
    .optional()
});

// User profile update schema
export const profileUpdateSchema = z.object({
  firstName: z.string()
    .min(1, errorMessages.name)
    .max(50, errorMessages.name)
    .trim()
    .optional(),
  lastName: z.string()
    .max(50, errorMessages.name)
    .trim()
    .optional(),
  email: z.string()
    .email(errorMessages.email)
    .trim()
    .toLowerCase()
    .optional(),
  phoneNumber: z.string()
    .regex(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .optional()
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SiteInput = z.infer<typeof siteSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type AssetInput = z.infer<typeof assetSchema>;
export type WorkOrderInput = z.infer<typeof workOrderSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Helper function to validate and format errors
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const key = issue.path[0];
      if (typeof key === 'string') {
        errors[key] = issue.message;
      }
    });
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}