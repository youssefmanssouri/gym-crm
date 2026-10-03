import { UserRole } from './types';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ['all', 'manage_staff', 'manage_finances', 'manage_members', 'manage_plans', 'view_reports', 'manage_settings'],
  MANAGER: ['manage_members', 'manage_plans', 'view_finances', 'view_reports', 'manage_inventory', 'manage_attendance'],
  TRAINER: ['view_assigned_members', 'manage_workouts', 'manage_nutrition', 'view_schedules'],
  RECEPTIONIST: ['manage_attendance', 'register_member', 'view_members', 'process_cash_payment'],
  MEMBER: ['view_own_profile', 'view_own_workout', 'view_own_nutrition', 'view_own_payments', 'qr_checkin'],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes('all') || permissions.includes(permission);
}

