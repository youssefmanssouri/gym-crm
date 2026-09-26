'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
  Shield,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Heart,
  Loader2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { MemberProfile, MembershipPlan } from '@/lib/types';
import { MOCK_MEMBERSHIP_PLANS } from '@/lib/mock-data';
import { exportToCSV } from '@/lib/export-utils';
import { apiGetMembers, apiCreateMember, apiDeleteMember, apiGetPlans } from '@/lib/api-client';

interface MembersModuleProps {
  initialSearch?: string;
}

export const MembersModule: React.FC<MembersModuleProps> = ({ initialSearch = '' }) => {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>(MOCK_MEMBERSHIP_PLANS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Member Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGender, setNewGender] = useState('Male');
  const [newHeight, setNewHeight] = useState('175');
  const [newWeight, setNewWeight] = useState('75');
  const [newGoal, setNewGoal] = useState('Strength & Muscle Gain');
  const [selectedPlanId, setSelectedPlanId] = useState('plan-quarterly');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [membersData, plansData] = await Promise.all([
        apiGetMembers().catch(() => []),
        apiGetPlans().catch(() => MOCK_MEMBERSHIP_PLANS),
      ]);
      setMembers(membersData);
      if (plansData.length > 0) {
        setPlans(plansData);
        setSelectedPlanId(plansData[0].id);
      }
    } catch (err: unknown) {
      console.error('Failed to load members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.user.name.toLowerCase().includes(search.toLowerCase()) ||
      m.user.email.toLowerCase().includes(search.toLowerCase()) ||
      m.qrCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && m.membership?.status === 'ACTIVE') ||
      (statusFilter === 'EXPIRED' && m.membership?.status === 'EXPIRED') ||
      (statusFilter === 'SUSPENDED' && m.user.status === 'SUSPENDED');
    return matchesSearch && matchesStatus;
  });

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const created = await apiCreateMember({
        name: newName,
        email: newEmail,
        phone: newPhone || '+1 (555) 019-0000',
        gender: newGender,
        heightCm: parseFloat(newHeight) || 175,
        weightKg: parseFloat(newWeight) || 75,
        targetWeightKg: (parseFloat(newWeight) || 75) - 3,
        fitnessGoal: newGoal,
        planId: selectedPlanId,
      });

      setMembers([created, ...members]);
      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to register member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete member ${name}?`)) return;
    try {
      await apiDeleteMember(id);
      setMembers(members.filter((m) => m.id !== id));
      if (selectedMember?.id === id) setSelectedMember(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete member');
    }
  };

  const handleExportCSV = () => {
    const data = members.map((m) => ({
      ID: m.id,
      Name: m.user.name,
      Email: m.user.email,
      Phone: m.user.phone,
      Plan: m.membership?.plan?.name || 'N/A',
      Status: m.membership?.status || 'INACTIVE',
      JoinDate: m.joinDate,
      QRCode: m.qrCode,
    }));
    exportToCSV('Apex_Gym_Members_Registry', data);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Member CRM Management</h2>
          <p className="text-xs text-zinc-400 mt-1">Manage active memberships, body stats, and digital QR passes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="glow" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
            + Register New Member
          </Button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member name, email, or QR code..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'ACTIVE', 'EXPIRED', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-cyan-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </Card>

      {/* Members Grid / Datagrid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500 text-xs">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
          <span>Loading member accounts...</span>
        </div>
      ) : filteredMembers.length === 0 ? (
        <Card className="py-16 text-center">
          <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-zinc-300">No members found</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'ALL'
              ? 'Try clearing your search query or status filter to see all registered members.'
              : 'Click "+ Register New Member" to add a member account.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
          <Card key={member.id} glow className="flex flex-col justify-between p-5 relative group">
            <div>
              {/* Member Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src={member.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={member.user.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-2xl object-cover border border-zinc-700"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{member.user.name}</h4>
                    <p className="text-xs text-zinc-400">{member.user.email}</p>
                    <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{member.qrCode}</p>
                  </div>
                </div>
                <Badge variant={member.membership?.status === 'ACTIVE' ? 'success' : 'danger'}>
                  {member.membership?.status || 'INACTIVE'}
                </Badge>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-center">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Weight</span>
                  <span className="text-xs font-bold text-white">{member.weightKg ? `${member.weightKg} kg` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Target</span>
                  <span className="text-xs font-bold text-cyan-400">{member.targetWeightKg ? `${member.targetWeightKg} kg` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Plan</span>
                  <span className="text-[11px] font-bold text-zinc-300 truncate block">{member.membership?.plan?.name.split(' ')[0] || 'Basic'}</span>
                </div>
              </div>

              {/* Goal & Dates */}
              <div className="mt-3 text-xs space-y-1 text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{member.fitnessGoal || 'General Fitness'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>Renews: {member.membership?.endDate || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">Joined {member.joinDate}</span>
              <Button variant="outline" size="sm" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => setSelectedMember(member)}>
                View Profile
              </Button>
            </div>
          </Card>
        ))}
        </div>
      )}

      {/* Member Profile Drawer / Modal */}
      {selectedMember && (
        <Modal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          title={`${selectedMember.user.name} — Member File`}
          subtitle={`ID: ${selectedMember.id} | Digital QR: ${selectedMember.qrCode}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Header Bio */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <Image
                src={selectedMember.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={selectedMember.user.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/40"
              />
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl font-bold text-white">{selectedMember.user.name}</h3>
                  <Badge variant={selectedMember.membership?.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {selectedMember.membership?.status}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400">{selectedMember.user.email} • {selectedMember.user.phone}</p>
                <p className="text-xs text-cyan-400 font-semibold">Goal: {selectedMember.fitnessGoal || 'Build Muscle'}</p>
              </div>

              {/* Digital Pass QR Simulation */}
              <div className="p-3 bg-white rounded-xl shadow-lg text-center shrink-0">
                <div className="w-16 h-16 bg-zinc-950 rounded flex items-center justify-center text-white font-mono text-[10px] font-bold tracking-tighter">
                  QR PASS
                </div>
                <span className="text-[9px] font-bold font-mono text-zinc-900 mt-1 block">{selectedMember.qrCode}</span>
              </div>
            </div>

            {/* Medical Notes & Emergency Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1">Emergency Contact</span>
                <p className="font-semibold text-white">{selectedMember.emergencyContactName || 'Lisa Chen (Spouse)'}</p>
                <p className="text-zinc-400">{selectedMember.emergencyContactPhone || '+1 (555) 019-9922'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1">Medical Notes</span>
                <p className="text-amber-400 font-medium">{selectedMember.medicalNotes || 'No reported allergies or injuries.'}</p>
              </div>
            </div>

            {/* Active Subscription Controls */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Subscription Controls</h4>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">{selectedMember.membership?.plan?.name || 'Standard Plan'}</p>
                  <p className="text-xs text-zinc-400">Valid: {selectedMember.membership?.startDate} to {selectedMember.membership?.endDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="danger" size="sm" onClick={() => handleDeleteMember(selectedMember.id, selectedMember.user.name)}>
                    Delete Member
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add New Member Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Gym Member" subtitle="Create member account and issue digital pass">
        <form onSubmit={handleCreateMember} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}
          <Input label="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Michael Jordan" required />
          <Input label="Email Address" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="michael@gmail.com" required />
          <Input label="Phone Number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Height (cm)" type="number" value={newHeight} onChange={(e) => setNewHeight(e.target.value)} />
            <Input label="Weight (kg)" type="number" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Select Membership Plan</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} (${plan.price} / {plan.durationMonths}mo)
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="glow" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Create Account & Pass'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
