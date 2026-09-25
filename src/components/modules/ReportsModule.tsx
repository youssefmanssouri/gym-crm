'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { exportToCSV } from '@/lib/export-utils';
import { apiGetPayments, apiGetMembers, apiGetAttendance } from '@/lib/api-client';
import { PaymentRecord, MemberProfile, AttendanceRecord } from '@/lib/types';

export const ReportsModule: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchReportsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [payRes, memRes, attRes] = await Promise.all([
        apiGetPayments().catch(() => ({ payments: [] })),
        apiGetMembers().catch(() => []),
        apiGetAttendance().catch(() => []),
      ]);
      setPayments(payRes.payments);
      setMembers(memRes);
      setAttendance(attRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load report data from PostgreSQL database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleExport = (title: string, data: object[]) => {
    if (data.length === 0) {
      setError(`Cannot export "${title}": No records found in the database.`);
      return;
    }
    setError(null);
    exportToCSV(title.replace(/\s+/g, '_'), data);
    setSuccessMsg(`Successfully generated and downloaded CSV for "${title}" (${data.length} records).`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const reportsList = [
    {
      title: 'Monthly Revenue & Financial Ledger Report',
      description: 'Authoritative transaction ledger with payment methods, status, and invoice IDs from PostgreSQL.',
      count: payments.length,
      data: payments.map((p) => ({
        InvoiceNumber: p.invoiceNumber,
        Date: p.date,
        MemberName: p.userName,
        MemberEmail: p.userEmail,
        AmountUSD: p.amount,
        PaymentMethod: p.paymentMethod,
        Status: p.status,
        Description: p.description,
      })),
      badgeText: `${payments.length} Payments`,
      badgeVariant: 'success' as const,
    },
    {
      title: 'Member Directory & Membership Status Report',
      description: 'Comprehensive roster of registered gym members, membership tiers, and contact information.',
      count: members.length,
      data: members.map((m) => ({
        ID: m.id,
        Name: m.user?.name || 'Member',
        Email: m.user?.email || 'N/A',
        Phone: m.user?.phone || 'N/A',
        MembershipTier: m.membership?.plan?.name || 'Standard',
        Status: m.user?.status || 'ACTIVE',
        JoinedDate: m.joinDate,
        FitnessGoal: m.fitnessGoal || 'General Fitness',
      })),
      badgeText: `${members.length} Members`,
      badgeVariant: 'cyan' as const,
    },
    {
      title: 'Daily Facility Check-in & Peak Hour Report',
      description: 'Access terminal scan logs, check-in timestamps, and verification methods.',
      count: attendance.length,
      data: attendance.map((a) => ({
        CheckInID: a.id,
        MemberName: a.userName,
        Role: a.userRole,
        Time: a.checkInTime,
        Method: a.method,
        VerifiedBy: a.verifiedBy || 'System Terminal',
      })),
      badgeText: `${attendance.length} Scans`,
      badgeVariant: 'purple' as const,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Reports & Business Analytics</h2>
          <p className="text-xs text-zinc-400 mt-1">Exportable CSV financial ledgers, member rosters, and attendance records from PostgreSQL.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReportsData}
            disabled={isLoading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Status Notifications */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportsList.map((rep, idx) => (
          <Card key={idx} glow className="p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <FileText className="w-6 h-6 text-cyan-400" />
                <Badge variant={rep.badgeVariant}>
                  {isLoading ? 'Querying...' : rep.badgeText}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-white mt-3">{rep.title}</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{rep.description}</p>
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold"
                icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                disabled={isLoading || rep.count === 0}
                onClick={() => handleExport(rep.title, rep.data)}
              >
                {isLoading ? 'Loading DB...' : rep.count === 0 ? 'No Records in DB' : 'Export Report (CSV)'}
              </Button>
              <p className="text-[10px] text-zinc-500 text-center mt-2">
                Protected against formula injection with sanitized CSV quoting.
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
