'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { UserCheck, Shield, Lock, Eye, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MOCK_AUDIT_LOGS, MOCK_USERS } from '@/lib/mock-data';

export const StaffModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'AUDIT'>('ROSTER');

  const staffMembers = [
    MOCK_USERS.admin,
    MOCK_USERS.manager,
    MOCK_USERS.trainer,
    MOCK_USERS.receptionist,
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Staff Management & Security Audit Logs</h2>
          <p className="text-xs text-zinc-400 mt-1">Role-based access matrix, staff assignments, and system audit trail.</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('ROSTER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ROSTER' ? 'bg-cyan-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Staff Roster
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'AUDIT' ? 'bg-cyan-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Security Audit Logs
          </button>
        </div>
      </div>

      {activeTab === 'ROSTER' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {staffMembers.map((staff) => (
            <Card key={staff.id} glow className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-3">
                  <Image
                    src={staff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={staff.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-2xl object-cover border border-zinc-700"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{staff.name}</h4>
                    <p className="text-xs text-zinc-400">{staff.email}</p>
                    <Badge variant={staff.role === 'ADMIN' ? 'cyan' : staff.role === 'TRAINER' ? 'purple' : 'default'} className="mt-1">
                      {staff.role}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mt-3">{staff.bio || 'Staff Member'}</p>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500">{staff.phone}</span>
                <Badge variant="success">Active</Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Security & Operational Audit Trail</h3>
            <Badge variant="cyan">SYSTEM AUDIT TRAIL</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="pb-2 px-2">Timestamp</th>
                  <th className="pb-2 px-2">User / Role</th>
                  <th className="pb-2 px-2">Action</th>
                  <th className="pb-2 px-2">Entity</th>
                  <th className="pb-2 px-2">Details</th>
                  <th className="pb-2 px-2 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {MOCK_AUDIT_LOGS.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-2.5 px-2 text-zinc-400 font-mono">{log.createdAt}</td>
                    <td className="py-2.5 px-2">
                      <span className="font-bold text-white">{log.userEmail}</span>
                      <span className="text-[10px] text-zinc-500 block font-mono">{log.userRole}</span>
                    </td>
                    <td className="py-2.5 px-2"><Badge variant="purple">{log.action}</Badge></td>
                    <td className="py-2.5 px-2 text-zinc-300">{log.entity}</td>
                    <td className="py-2.5 px-2 text-zinc-400">{log.details}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-zinc-500">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
