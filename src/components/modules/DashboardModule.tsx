'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  UserCheck,
  Sparkles,
  ArrowUpRight,
  Clock,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { apiGetAnalytics, AnalyticsResponse } from '@/lib/api-client';

interface DashboardModuleProps {
  onNavigate: (tab: string) => void;
  onOpenCheckIn: () => void;
  onOpenAddMember: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  onNavigate,
  onOpenCheckIn,
  onOpenAddMember,
}) => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiGetAnalytics();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch facility analytics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Gym Operations Center</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Apex Fitness Overview</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Live facility metrics, active member attendance, financial performance, and operational alerts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={isLoading} icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}>
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenAddMember}>
            + Register Member
          </Button>
          <Button variant="primary" size="sm" icon={<Sparkles className="w-4 h-4" />} onClick={onOpenCheckIn}>
            Launch Check-in
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAnalytics} className="border-rose-500/40 text-rose-300 hover:bg-rose-900/30">
            Retry
          </Button>
        </div>
      )}

      {/* Loading state skeleton */}
      {isLoading && !data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-32 bg-zinc-900/40 border-zinc-800">
              <div className="h-full" />
            </Card>
          ))}
        </div>
      )}

      {/* KPI Cards Grid */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Members */}
          <Card className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Members</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">{data.kpis.activeMembers}</span>
              <span className="text-xs text-emerald-400 flex items-center font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Out of {data.kpis.totalMembers} total registered accounts</p>
          </Card>

          {/* Monthly Revenue */}
          <Card className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Monthly Revenue</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">${data.kpis.monthlyRevenue.toLocaleString()}</span>
              <span className="text-xs text-emerald-400 flex items-center font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" /> MTD
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">${data.kpis.weeklyRevenue.toLocaleString()} collected past 7 days</p>
          </Card>

          {/* Today's Check-ins */}
          <Card className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Today&apos;s Check-ins</span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">{data.kpis.todayAttendance}</span>
              <span className="text-xs text-zinc-400 flex items-center font-medium">Logged Today</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Front desk and turnstile scans today</p>
          </Card>

          {/* Retention & Churn */}
          <Card className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Retention Rate</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">{data.kpis.retentionRate}%</span>
              <span className="text-xs text-emerald-400 flex items-center font-semibold">
                Churn {data.kpis.churnRate}%
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">{data.kpis.expiringMemberships} plans expiring within 14 days</p>
          </Card>
        </div>
      )}

      {/* Analytics Charts Section */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Revenue Trajectory Chart */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Revenue Trajectory (Last 6 Months)</h3>
                <p className="text-xs text-zinc-400">Monthly recurring memberships vs POS retail sales</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span className="text-zinc-300">Subscriptions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-zinc-300">POS Sales</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              {data.charts.revenue.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                  No payment transactions recorded yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.charts.revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRecurring" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="recurring" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorRecurring)" />
                    <Area type="monotone" dataKey="pos" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorPos)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Daily Attendance Heatmap / Hour Bar Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Facility Peak Hours Today</h3>
                <p className="text-xs text-zinc-400">Distribution of today&apos;s check-ins by hour block</p>
              </div>
            </div>
            <div className="h-72 w-full">
              {data.charts.attendance.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                  No check-in entries logged today.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.attendance} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="hour" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem' }} />
                    <Bar dataKey="members" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* AI Business Insights & Live Check-in Activity */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Operational Alerts & Automated Insights Card */}
          <Card className="bg-zinc-900/60 border border-zinc-800 relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Operational Alerts</h4>
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Automated Telemetry</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <p className="font-semibold text-white">Expiring Subscriptions</p>
                <p className="text-[11px] font-normal text-zinc-400 mt-1">
                  {data.kpis.expiringMemberships} members have plans expiring within 14 days. Review retention status or notify members.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <p className="font-semibold text-white">Monthly Cashflow</p>
                <p className="text-[11px] font-normal text-zinc-400 mt-1">
                  ${data.kpis.monthlyRevenue.toLocaleString()} recorded month-to-date across {data.kpis.activeMembers} active member accounts.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
              onClick={() => onNavigate('memberships')}
            >
              Manage Memberships →
            </Button>
          </Card>

          {/* Live Attendance Stream Table */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Recent Check-in Terminal Activity</h3>
                <p className="text-xs text-zinc-400">Scan logs from QR & Front Desk access records</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('attendance')}>
                View Full Logs <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                    <th className="pb-3 px-2">Member</th>
                    <th className="pb-3 px-2">Check-in Time</th>
                    <th className="pb-3 px-2">Verification Method</th>
                    <th className="pb-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {data.activity.recentAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500 italic">
                        No check-ins logged yet today. Launch the Check-in Terminal to scan QR or search members.
                      </td>
                    </tr>
                  ) : (
                    data.activity.recentAttendance.map((record) => (
                      <tr key={record.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-2 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-[10px]">
                            {record.userName.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white">{record.userName}</span>
                        </td>
                        <td className="py-3 px-2 text-zinc-300">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            {record.checkInTime}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={record.method === 'QR_CODE' ? 'cyan' : 'purple'}>{record.method}</Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Badge variant="success">Access Granted</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
