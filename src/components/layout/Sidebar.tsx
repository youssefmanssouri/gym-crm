'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  QrCode,
  Dumbbell,
  Apple,
  DollarSign,
  Package,
  UserCheck,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { hasPermission } from '@/lib/auth';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, userRole, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'all' },
    { id: 'members', label: 'Member CRM', icon: Users, perm: 'view_members' },
    { id: 'memberships', label: 'Membership Plans', icon: CreditCard, perm: 'manage_plans' },
    { id: 'attendance', label: 'Attendance Terminal', icon: QrCode, perm: 'manage_attendance' },
    { id: 'trainers', label: 'Trainer Hub', icon: Dumbbell, perm: 'view_assigned_members' },
    { id: 'workouts', label: 'Workout Builder & AI', icon: Flame, perm: 'all' },
    { id: 'nutrition', label: 'Nutrition Planner', icon: Apple, perm: 'all' },
    { id: 'payments', label: 'Payments & Billing', icon: DollarSign, perm: 'view_finances' },
    { id: 'inventory', label: 'Inventory & POS', icon: Package, perm: 'manage_inventory' },
    { id: 'staff', label: 'Staff & Audit Logs', icon: UserCheck, perm: 'manage_staff' },
    { id: 'ai-suite', label: 'AI Power Suite', icon: Bot, perm: 'all' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, perm: 'view_reports' },
    { id: 'settings', label: 'Settings', icon: Settings, perm: 'manage_settings' },
  ];

  const visibleItems = menuItems.filter((item) => hasPermission(userRole, item.perm) || userRole === 'ADMIN');

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-900">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Dumbbell className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              APEX <span className="text-cyan-400 text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">CRM</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium tracking-wider">GYM MANAGEMENT SYSTEM</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 max-h-[calc(100vh-190px)] overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Core Operations</div>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-zinc-900 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/5'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status & Logout */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/80 space-y-2">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-300">Auth Active</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">{userRole}</span>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
