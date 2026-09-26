'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardModule } from '@/components/modules/DashboardModule';
import { MembersModule } from '@/components/modules/MembersModule';
import { MembershipsModule } from '@/components/modules/MembershipsModule';
import { AttendanceModule } from '@/components/modules/AttendanceModule';
import { Modal } from '@/components/ui/Modal';
import { UserRole, User } from '@/lib/types';
import { apiGetSession, apiLogout } from '@/lib/api-client';
import { Dumbbell, ShieldCheck, Loader2 } from 'lucide-react';

const ModuleLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 animate-pulse">
    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
    </div>
    <p className="text-xs text-zinc-400 font-medium">Loading workspace module...</p>
  </div>
);

const WorkoutBuilderModule = dynamic(
  () => import('@/components/modules/WorkoutBuilderModule').then((m) => m.WorkoutBuilderModule),
  { loading: () => <ModuleLoadingFallback /> }
);
const NutritionModule = dynamic(
  () => import('@/components/modules/NutritionModule').then((m) => m.NutritionModule),
  { loading: () => <ModuleLoadingFallback /> }
);
const PaymentsModule = dynamic(
  () => import('@/components/modules/PaymentsModule').then((m) => m.PaymentsModule),
  { loading: () => <ModuleLoadingFallback /> }
);
const InventoryModule = dynamic(
  () => import('@/components/modules/InventoryModule').then((m) => m.InventoryModule),
  { loading: () => <ModuleLoadingFallback /> }
);
const StaffModule = dynamic(
  () => import('@/components/modules/StaffModule').then((m) => m.StaffModule),
  { loading: () => <ModuleLoadingFallback /> }
);
const AiSuiteModule = dynamic(
  () => import('@/components/modules/AiSuiteModule').then((m) => m.AiSuiteModule),
  { loading: () => <ModuleLoadingFallback /> }
);
const ReportsModule = dynamic(
  () => import('@/components/modules/ReportsModule').then((m) => m.ReportsModule),
  { loading: () => <ModuleLoadingFallback /> }
);
const SettingsModule = dynamic(
  () => import('@/components/modules/SettingsModule').then((m) => m.SettingsModule),
  { loading: () => <ModuleLoadingFallback /> }
);

export default function GymCRMMainApp() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    async function verifyAuth() {
      const session = await apiGetSession();
      if (!session.authenticated || !session.user) {
        window.location.href = '/login';
        return;
      }
      setCurrentUser(session.user);
      setIsCheckingAuth(false);
    }

    verifyAuth();
  }, []);

  const handleLogout = async () => {
    await apiLogout();
    window.location.href = '/login';
  };

  if (isCheckingAuth || !currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Dumbbell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-sm font-bold text-white tracking-wider uppercase flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Apex Fitness CRM
            </h2>
            <p className="text-xs text-zinc-500">Loading workspace session...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentRole: UserRole = currentUser.role || 'MEMBER';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans antialiased selection:bg-cyan-500 selection:text-zinc-950">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={currentRole}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentUser={currentUser}
          onOpenCheckIn={() => setIsCheckInModalOpen(true)}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          onSearchQuery={(q) => {
            setGlobalSearch(q);
            if (q.length > 2 && currentTab !== 'members') setCurrentTab('members');
          }}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardModule
              onNavigate={setCurrentTab}
              onOpenCheckIn={() => setIsCheckInModalOpen(true)}
              onOpenAddMember={() => setCurrentTab('members')}
            />
          )}

          {currentTab === 'members' && <MembersModule initialSearch={globalSearch} />}
          {currentTab === 'memberships' && <MembershipsModule />}
          {currentTab === 'attendance' && <AttendanceModule />}
          {currentTab === 'trainers' && <WorkoutBuilderModule />}
          {currentTab === 'workouts' && <WorkoutBuilderModule />}
          {currentTab === 'nutrition' && <NutritionModule />}
          {currentTab === 'payments' && <PaymentsModule />}
          {currentTab === 'inventory' && <InventoryModule />}
          {currentTab === 'staff' && <StaffModule />}
          {currentTab === 'ai-suite' && <AiSuiteModule />}
          {currentTab === 'reports' && <ReportsModule />}
          {currentTab === 'settings' && <SettingsModule />}
        </main>
      </div>

      {/* Quick QR Check-in Terminal Modal */}
      <Modal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        title="QR Pass Access Terminal"
        subtitle="Position member pass code under scanner camera"
        maxWidth="max-w-xl"
      >
        <AttendanceModule onScanCompleted={() => setTimeout(() => setIsCheckInModalOpen(false), 2000)} />
      </Modal>
    </div>
  );
}
