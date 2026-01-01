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
	unitId: z.string()
		.min(1, 'Please select a unit')
		.cuid('Invalid unit selection'),
	type: z.enum(['HVAC', 'ELECTRICAL', 'PLUMBING', 'FIRE_SAFETY', 'ELEVATOR', 'SECURITY_SYSTEM', 'OTHER'])
		.optional(),
	status: z.enum(['OPERATIONAL', 'NEEDS_MAINTENANCE', 'OUT_OF_SERVICE'])
		.optional(),
	description: z.string()
		.max(1000, 'Description must be less than 1000 characters')
		.trim()
		.optional(),
	purchaseDate: z.string()
		.datetime('Invalid date format')
		.optional(),
	warrantyExpiry: z.string()
		.datetime('Invalid date format')
		.optional()
});

// Work order creation schema
export const workOrderCreateSchema = z.object({
	title: z.string()
		.min(1, 'Title is required')
		.max(200, 'Title must be less than 200 characters')
		.trim(),
	description: z.string()
		.max(5000, 'Description must be less than 5000 characters')
		.trim()
		.optional(),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'])
		.optional(),
	dueDate: z.string()
		.datetime('Invalid due date format')
		.optional(),
	assignedToId: z.string()
		.cuid('Invalid user selection')
		.optional(),
	selectionMode: z.enum(['asset', 'unit', 'building', 'site'])
		.optional(),
	assetId: z.string()
		.cuid('Invalid asset selection')
		.optional(),
	unitId: z.string()
		.cuid('Invalid unit selection')
		.optional(),
	buildingId: z.string()
		.cuid('Invalid building selection')
		.optional(),
	siteId: z.string()
		.cuid('Invalid site selection')
		.optional()
});

// Work order update schema (for detail page edits)
export const workOrderUpdateSchema = z.object({
	title: z.string()
		.min(1, 'Title is required')
		.max(200, 'Title must be less than 200 characters')
		.trim(),
	description: z.string()
		.max(5000, 'Description must be less than 5000 characters')
		.trim()
		.optional(),
	assetId: z.string()
		.min(1, 'Asset is required')
		.cuid('Invalid asset selection')
});

// Work order status change schema
export const workOrderStatusSchema = z.object({
	workOrderId: z.string()
		.min(1, 'Work order ID is required')
		.cuid('Invalid work order ID'),
	status: z.enum(['PENDING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'])
});

// Work order assignment schema
export const workOrderAssignSchema = z.object({
	workOrderId: z.string()
		.min(1, 'Work order ID is required')
		.cuid('Invalid work order ID'),
	assignedToId: z.string()
		.cuid('Invalid user selection')
		.optional()
});

// Work order comment schema
export const workOrderCommentSchema = z.object({
	content: z.string()
		.min(1, 'Comment cannot be empty')
		.max(5000, 'Comment must be less than 5000 characters')
		.trim(),
	parentId: z.string()
		.min(1, 'Invalid parent comment ID')
		.optional()
});

// Work order checklist item schema
export const workOrderChecklistSchema = z.object({
	title: z.string()
		.min(1, 'Title is required')
		.max(200, 'Title must be less than 200 characters')
		.trim()
});

// Work order template item schema (used within templates)
const workOrderTemplateItemSchema = z.object({
	title: z.string()
		.min(1, 'Item title is required')
		.max(200, 'Item title must be less than 200 characters')
		.trim(),
	id: z.string().optional() // For updates - existing items have IDs
});

// Work order template creation schema
export const workOrderTemplateSchema = z.object({
	name: z.string()
		.min(1, 'Template name is required')
		.max(100, 'Name must be less than 100 characters')
		.trim(),
	description: z.string()
		.max(500, 'Description must be less than 500 characters')
		.trim()
		.optional(),
	title: z.string()
		.min(1, 'Default title is required')
		.max(200, 'Title must be less than 200 characters')
		.trim()
		.optional(),
	workDescription: z.string()
		.max(5000, 'Description must be less than 5000 characters')
		.trim()
		.optional(),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'])
		.optional(),
	isGlobal: z.boolean().optional(),
	items: z.array(workOrderTemplateItemSchema)
		.min(1, 'At least one checklist item is required')
});

// Work order template update schema (partial - all fields optional)
export const workOrderTemplateUpdateSchema = workOrderTemplateSchema.partial();

// Legacy alias for backward compatibility
export const workOrderSchema = workOrderCreateSchema;

// Emergency password reset request schema
export const emergencyResetRequestSchema = z.object({
  email: z.string()
    .email(errorMessages.email)
    .trim()
    .toLowerCase(),
  passphrase: z.string()
    .min(1, 'Passphrase is required')
    .trim()
});

// Password reset confirmation schema
export const passwordResetSchema = z.object({
  token: z.string()
    .min(1, 'Reset token is required')
    .trim(),
  password: z.string()
    .min(8, errorMessages.password.minLength)
    .regex(passwordPatterns.uppercase, errorMessages.password.uppercase)
    .regex(passwordPatterns.lowercase, errorMessages.password.lowercase)
    .regex(passwordPatterns.number, errorMessages.password.number)
    .regex(passwordPatterns.special, errorMessages.password.special),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
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
export type WorkOrderCreateInput = z.infer<typeof workOrderCreateSchema>;
export type WorkOrderUpdateInput = z.infer<typeof workOrderUpdateSchema>;
export type WorkOrderStatusInput = z.infer<typeof workOrderStatusSchema>;
export type WorkOrderAssignInput = z.infer<typeof workOrderAssignSchema>;
export type WorkOrderCommentInput = z.infer<typeof workOrderCommentSchema>;
export type WorkOrderChecklistInput = z.infer<typeof workOrderChecklistSchema>;
export type WorkOrderTemplateInput = z.infer<typeof workOrderTemplateSchema>;
export type WorkOrderTemplateUpdateInput = z.infer<typeof workOrderTemplateUpdateSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type EmergencyResetRequestInput = z.infer<typeof emergencyResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

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