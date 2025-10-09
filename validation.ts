import { z } from 'zod';

// Transaction validation schema
export const transactionSchema = z.object({
  date: z.string()
    .min(1, 'Date is required')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),

  description: z.string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters')
    .trim(),

  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),

  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(999999.99, 'Amount must be less than 1,000,000'),

  type: z.enum(['Income', 'Expense'] as const)
    .refine(val => val === 'Income' || val === 'Expense', 'Transaction type is required'),

  donorName: z.string()
    .max(100, 'Donor name must be less than 100 characters')
    .optional(),

  donorContact: z.string()
    .max(100, 'Donor contact must be less than 100 characters')
    .optional(),

  selectedMemberId: z.string()
    .optional()
});

// Member validation schema
export const memberSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),

  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  phone: z.string()
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),

  address: z.string()
    .max(200, 'Address must be less than 200 characters')
    .optional()
    .or(z.literal('')),

  dateJoined: z.string()
    .min(1, 'Date joined is required')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),

  role: z.string()
    .max(50, 'Role must be less than 50 characters')
    .optional()
    .or(z.literal('')),

  emergencyContact: z.string()
    .max(100, 'Emergency contact must be less than 100 characters')
    .optional()
    .or(z.literal(''))
});

// Budget validation schema
export const budgetSchema = z.object({
  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),

  amount: z.number()
    .positive('Budget amount must be greater than 0')
    .max(999999.99, 'Budget amount must be less than 1,000,000'),

  month: z.string()
    .regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),

  password: z.string()
    .min(6, 'Password must be at least 6 characters')
});

// Type exports for form data
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type MemberFormData = z.infer<typeof memberSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

// Validation helper function
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: undefined,
        errors: error.issues.reduce((acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {} as Record<string, string>)
      };
    }
    return {
      success: false,
      data: undefined,
      errors: { general: 'Validation failed' }
    };
  }
};
