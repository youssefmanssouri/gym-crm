'use client';

import React, { useState } from 'react';
import { DollarSign, Printer, Download, Plus, Search, CreditCard, CheckCircle2, Clock, FileText } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { PaymentRecord } from '@/lib/types';
import { exportToCSV, printInvoice } from '@/lib/export-utils';
import { apiGetPayments, apiCreatePayment } from '@/lib/api-client';

export const PaymentsModule: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [aggregates, setAggregates] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    refundRate: '0.0%',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState(false);

  // New Payment Form
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [amount, setAmount] = useState('159');
  const [method, setMethod] = useState<'CARD' | 'CASH' | 'RECURRING'>('CARD');

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const data = await apiGetPayments();
      setPayments(data.payments);
      setAggregates(data.aggregates);
    } catch (err: unknown) {
      console.error('Failed to load payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = payments.filter(
    (p) =>
      p.userName.toLowerCase().includes(search.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!payerName || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Please enter a valid member name and an amount greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const created = await apiCreatePayment({
        amount: numericAmount,
        paymentMethod: method,
        memberName: payerName,
        memberEmail: payerEmail || undefined,
        description: 'Gym Fee Payment',
      });

      setPayments([created, ...payments]);
      setAggregates((prev) => ({
        ...prev,
        totalRevenue: prev.totalRevenue + created.amount,
      }));
      setIsNewPaymentModalOpen(false);
      setPayerName('');
      setPayerEmail('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const data = payments.map((p) => ({
      InvoiceNumber: p.invoiceNumber,
      MemberName: p.userName,
      Email: p.userEmail,
      Amount: p.amount,
      Method: p.paymentMethod,
      Status: p.status,
      Date: p.date,
    }));
    exportToCSV('Apex_Gym_Payments_Ledger', data);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Payments & Financial Invoicing</h2>
          <p className="text-xs text-zinc-400 mt-1">Transaction ledgers, PDF invoice receipts, and cash/card POS processing.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="glow" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsNewPaymentModalOpen(true)}>
            + Record Payment
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card glow className="p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Revenue Processed</span>
          <div className="text-2xl font-black text-white mt-1">
            ${aggregates.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">Active ledger total</span>
        </Card>
        <Card glow className="p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pending Automated Debits</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            ${aggregates.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-zinc-500">Unsettled / queued subscriptions</span>
        </Card>
        <Card glow className="p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Refund Rate</span>
          <div className="text-2xl font-black text-white mt-1">{aggregates.refundRate}</div>
          <span className="text-[11px] text-emerald-400 font-semibold">Low risk indicator</span>
        </Card>
      </div>

      {/* Filter Toolbar & Table */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice number or member name..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-2">Invoice #</th>
                <th className="pb-3 px-2">Member</th>
                <th className="pb-3 px-2">Amount</th>
                <th className="pb-3 px-2">Payment Method</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Date</th>
                <th className="pb-3 px-2 text-right">Invoice Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-2 font-mono font-bold text-cyan-400">{p.invoiceNumber}</td>
                  <td className="py-3 px-2">
                    <p className="font-semibold text-white">{p.userName}</p>
                    <p className="text-[10px] text-zinc-500">{p.userEmail}</p>
                  </td>
                  <td className="py-3 px-2 font-bold text-white">${p.amount.toFixed(2)}</td>
                  <td className="py-3 px-2"><Badge variant="default">{p.paymentMethod}</Badge></td>
                  <td className="py-3 px-2">
                    <Badge variant={p.status === 'COMPLETED' ? 'success' : 'warning'}>{p.status}</Badge>
                  </td>
                  <td className="py-3 px-2 text-zinc-400">{p.date}</td>
                  <td className="py-3 px-2 text-right">
                    <Button variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5" />} onClick={() => printInvoice(p)}>
                      Print PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Modal */}
      <Modal isOpen={isNewPaymentModalOpen} onClose={() => setIsNewPaymentModalOpen(false)} title="Record New Payment" subtitle="Process cash, card, or manual membership fee">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}
          <Input label="Member Name" value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="e.g. Emily Watson" required />
          <Input label="Email Address" type="email" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} placeholder="emily@yahoo.com" />
          <Input label="Amount Paid ($ USD)" type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as 'CARD' | 'CASH' | 'RECURRING')}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="CARD">Credit / Debit Card</option>
              <option value="CASH">Cash Payment</option>
              <option value="RECURRING">Automated Recurring Debit</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
            <Button variant="ghost" type="button" onClick={() => setIsNewPaymentModalOpen(false)}>Cancel</Button>
            <Button variant="glow" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Complete & Record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
