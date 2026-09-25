export type UserRole = 'ADMIN' | 'MANAGER' | 'TRAINER' | 'RECEPTIONIST' | 'MEMBER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type MembershipStatus = 'ACTIVE' | 'FROZEN' | 'CANCELLED' | 'EXPIRED';
export type PlanType = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL' | 'STUDENT' | 'VIP' | 'PERSONAL_TRAINING';
export type CheckInMethod = 'QR_CODE' | 'BARCODE' | 'MANUAL' | 'RECEPTIONIST';
export type PaymentMethod = 'CASH' | 'CARD' | 'RECURRING' | 'ONLINE';
export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'FAILED';
export type ProductCategory = 'SUPPLEMENT' | 'DRINK' | 'MERCHANDISE' | 'EQUIPMENT' | 'OTHER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
}

export interface MemberProfile {
  id: string;
  userId: string;
  user: User;
  gender?: string;
  dob?: string;
  heightCm?: number;
  weightKg?: number;
  targetWeightKg?: number;
  fitnessGoal?: string;
  medicalNotes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  qrCode: string;
  joinDate: string;
  membership?: MemberMembership;
}

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  durationMonths: number;
  price: number;
  type: PlanType;
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
}

export interface MemberMembership {
  id: string;
  memberId: string;
  planId: string;
  plan?: MembershipPlan;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
  autoRenew: boolean;
  pricePaid: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: UserRole;
  checkInTime: string;
  checkOutTime?: string;
  method: CheckInMethod;
  verifiedBy?: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string;
  restSeconds: number;
  instructions?: string;
}

export type WorkoutLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  level: WorkoutLevel;
  goal: string;
  isTemplate: boolean;
  createdBy: string;
  assignedToName?: string;
  exercises: ExerciseItem[];
  createdAt: string;
}

export interface MealItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealCategory {
  title: string;
  time: string;
  meals: MealItem[];
}

export interface NutritionPlan {
  id: string;
  title: string;
  dietType?: string;
  assignedToName?: string;
  assignedToId?: string | null;
  createdBy: string;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  mealCategories: MealCategory[];
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  membershipPlanName?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  invoiceNumber: string;
  description: string;
  date: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  sku: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  supplier: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'MEMBERSHIP' | 'PAYMENT' | 'BIRTHDAY' | 'TRAINER' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface SecurityAuditLog {
  id: string;
  userEmail: string;
  userRole: string;
  action: string;
  entity: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface DashboardKPIs {
  activeMembers: number;
  totalMembers: number;
  todayAttendance: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  outstandingPayments: number;
  expiringMemberships: number;
  churnRate: number;
  retentionRate: number;
}
