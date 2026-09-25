import { z } from 'zod';

export const createMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Valid email is required').max(120),
  phone: z.string().max(30).optional().default('+1 (555) 019-0000'),
  gender: z.string().max(30).optional().default('Unspecified'),
  heightCm: z.number().min(50).max(260).optional().default(175),
  weightKg: z.number().min(20).max(350).optional().default(75),
  targetWeightKg: z.number().min(20).max(350).optional().default(72),
  fitnessGoal: z.string().max(200).optional().default('General Fitness'),
  medicalNotes: z.string().max(500).optional().default(''),
  emergencyContactName: z.string().max(100).optional().default(''),
  emergencyContactPhone: z.string().max(30).optional().default(''),
  planId: z.string().min(1, 'Membership plan ID is required'),
});

export const updateMemberSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(30).optional(),
  gender: z.string().max(30).optional(),
  heightCm: z.number().min(50).max(260).optional(),
  weightKg: z.number().min(20).max(350).optional(),
  targetWeightKg: z.number().min(20).max(350).optional(),
  fitnessGoal: z.string().max(200).optional(),
  medicalNotes: z.string().max(500).optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().max(30).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export const createPaymentSchema = z.object({
  userId: z.string().optional(),
  memberEmail: z.string().email().optional(),
  memberName: z.string().max(100).optional(),
  amount: z.number().positive('Payment amount must be greater than 0').max(50000),
  paymentMethod: z.enum(['CARD', 'CASH', 'RECURRING', 'ONLINE']).default('CARD'),
  description: z.string().max(255).optional().default('Manual POS Payment'),
  membershipId: z.string().optional(),
});

export const checkInSchema = z.object({
  qrCode: z.string().min(3, 'QR code or pass identifier is required').max(100),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(120),
  category: z.enum(['SUPPLEMENT', 'DRINK', 'MERCHANDISE', 'EQUIPMENT', 'OTHER']).default('SUPPLEMENT'),
  sku: z.string().min(2, 'SKU must be at least 2 characters').max(50),
  price: z.number().positive('Price must be greater than 0'),
  costPrice: z.number().min(0).optional(),
  stockQuantity: z.number().int().min(0, 'Stock cannot be negative').default(0),
  minStockLevel: z.number().int().min(0).default(5),
  supplier: z.string().max(120).optional().default('Apex Fitness Logistics'),
});

export const checkoutProductSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100).default(1),
  paymentMethod: z.enum(['CARD', 'CASH', 'RECURRING', 'ONLINE']).default('CARD'),
});

// -------------------------------------------------------------
// WORKOUT VALIDATION SCHEMAS
// -------------------------------------------------------------

export const exerciseItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Exercise name is required').max(100),
  category: z.string().max(50).default('Hypertrophy'),
  muscleGroup: z.string().max(50).default('All'),
  equipment: z.string().max(50).default('Free Weights'),
  sets: z.coerce.number().int().min(1, 'Sets must be at least 1').max(50).default(4),
  reps: z.coerce.string().max(30).default('8-12'),
  restSeconds: z.coerce.number().int().min(0).max(600).default(60),
  instructions: z.string().max(500).optional().default(''),
});

export const createWorkoutPlanSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  description: z.string().max(500).optional().default(''),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
  goal: z.string().max(100).optional().default('Hypertrophy'),
  isTemplate: z.boolean().default(false),
  assignedToId: z.string().min(1).optional().nullable(),
  exercises: z.array(exerciseItemSchema).min(1, 'At least one exercise is required').max(30),
});

export const updateWorkoutPlanSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  goal: z.string().max(100).optional(),
  isTemplate: z.boolean().optional(),
  assignedToId: z.string().min(1).optional().nullable(),
  exercises: z.array(exerciseItemSchema).min(1).max(30).optional(),
});

export const workoutAiOutputSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional().default(''),
  exercises: z.array(
    z.object({
      name: z.string().min(1).max(100),
      category: z.string().max(50).optional().default('Strength'),
      muscleGroup: z.string().max(50).optional().default('All'),
      equipment: z.string().max(50).optional().default('Free Weights'),
      sets: z.coerce.number().int().min(1).max(20).default(4),
      reps: z.coerce.string().max(30).default('8-12'),
      restSeconds: z.coerce.number().int().min(0).max(600).default(60),
      instructions: z.string().max(500).optional().default(''),
    })
  ).min(1).max(20),
});

// -------------------------------------------------------------
// NUTRITION VALIDATION SCHEMAS
// -------------------------------------------------------------

export const mealItemSchema = z.object({
  name: z.string().min(1, 'Meal item name is required').max(120),
  portion: z.string().max(80).default('1 serving'),
  calories: z.coerce.number().min(0).max(4000).default(0),
  protein: z.coerce.number().min(0).max(300).default(0),
  carbs: z.coerce.number().min(0).max(500).default(0),
  fat: z.coerce.number().min(0).max(300).default(0),
});

export const mealCategorySchema = z.object({
  title: z.string().min(1, 'Meal category title is required').max(80),
  time: z.string().max(30).default('12:00 PM'),
  meals: z.array(mealItemSchema).min(1, 'At least one meal item is required').max(20),
});

export const createNutritionPlanSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  dietType: z.string().max(80).default('High Protein'),
  assignedToId: z.string().min(1).optional().nullable(),
  dailyCalories: z.coerce.number().int().min(500).max(10000),
  proteinGrams: z.coerce.number().int().min(0).max(800),
  carbsGrams: z.coerce.number().int().min(0).max(1200),
  fatGrams: z.coerce.number().int().min(0).max(500),
  mealCategories: z.array(mealCategorySchema).min(1, 'At least one meal category is required').max(10),
});

export const updateNutritionPlanSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  dietType: z.string().max(80).optional(),
  assignedToId: z.string().min(1).optional().nullable(),
  dailyCalories: z.coerce.number().int().min(500).max(10000).optional(),
  proteinGrams: z.coerce.number().int().min(0).max(800).optional(),
  carbsGrams: z.coerce.number().int().min(0).max(1200).optional(),
  fatGrams: z.coerce.number().int().min(0).max(500).optional(),
  mealCategories: z.array(mealCategorySchema).min(1).max(10).optional(),
});

export const nutritionAiOutputSchema = z.object({
  title: z.string().min(1).max(120),
  dailyCalories: z.coerce.number().int().min(500).max(10000),
  proteinGrams: z.coerce.number().int().min(0).max(800),
  carbsGrams: z.coerce.number().int().min(0).max(1200),
  fatGrams: z.coerce.number().int().min(0).max(500),
  mealCategories: z.array(
    z.object({
      title: z.string().min(1).max(80),
      time: z.string().max(30).optional().default('12:00 PM'),
      meals: z.array(
        z.object({
          name: z.string().min(1).max(120),
          portion: z.string().max(80).optional().default('1 serving'),
          calories: z.coerce.number().min(0).max(4000).default(0),
          protein: z.coerce.number().min(0).max(300).default(0),
          carbs: z.coerce.number().min(0).max(500).default(0),
          fat: z.coerce.number().min(0).max(300).default(0),
        })
      ).min(1).max(15),
    })
  ).min(1).max(8),
});
