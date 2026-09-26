'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Plus, Sparkles, Tag, Shield, Star, DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { MembershipPlan, MemberProfile } from '@/lib/types';
import { MOCK_MEMBERSHIP_PLANS, MOCK_MEMBERS } from '@/lib/mock-data';
import { apiGetMembers } from '@/lib/api-client';

export const MembershipsModule: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>(MOCK_MEMBERSHIP_PLANS);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<number | null>(null);
  const [assigningPlan, setAssigningPlan] = useState<MembershipPlan | null>(null);
  const [members, setMembers] = useState<MemberProfile[]>(MOCK_MEMBERS);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(MOCK_MEMBERS[0]?.id || '');
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    apiGetMembers().then((res) => {
      if (res && res.length > 0) {
        setMembers(res);
        setSelectedMemberId(res[0].id);
      }
    }).catch(() => {});
  }, []);

  // New Plan Form State
  const [planName, setPlanName] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planDuration, setPlanDuration] = useState('1');
  const [planPerks, setPlanPerks] = useState('24/7 Access, Free Towels, Sauna');

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !planPrice) return;

    const newPlan: MembershipPlan = {
      id: `plan-${Date.now()}`,
      name: planName,
      description: planDesc || 'Custom membership tier.',
      price: parseFloat(planPrice) || 99,
      durationMonths: parseInt(planDuration, 10) || 1,
      type: 'MONTHLY',
      features: planPerks.split(',').map((p) => p.trim()),
      isActive: true,
    };

    setPlans([...plans, newPlan]);
    setIsAddPlanModalOpen(false);
    setPlanName('');
    setPlanPrice('');
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'APEX20' || couponCode.toUpperCase() === 'FITNESS2026') {
      setDiscountApplied(20);
    } else {
      alert('Invalid coupon code. Try APEX20 for 20% off!');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Membership Plans & Pricing</h2>
          <p className="text-xs text-zinc-400 mt-1">Configure subscription tiers, discount rules, and perk bundles.</p>
        </div>
        <Button variant="glow" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddPlanModalOpen(true)}>
          + Create Membership Plan
        </Button>
      </div>

      {/* Coupon & Promotional Banner */}
      <Card className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-cyan-950/40 border-cyan-500/30 flex flex-col md:flex-row items-center justify-between p-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Promotional Coupon Discount Engine</h4>
            <p className="text-xs text-zinc-400">Test promo code <span className="text-cyan-400 font-mono font-bold">APEX20</span> for a 20% discount across all tiers.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            placeholder="Enter promo code (e.g. APEX20)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="w-full md:w-56"
          />
          <Button variant="outline" size="sm" onClick={handleApplyCoupon}>
            Apply Code
          </Button>
        </div>
      </Card>

      {discountApplied && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-semibold flex items-center justify-between">
          <span>🎉 Promo Code APEX20 Applied! 20% discount calculated on all checkout tiers.</span>
          <button onClick={() => setDiscountApplied(null)} className="underline">Remove</button>
        </div>
      )}

      {assignSuccess && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-xs text-cyan-400 font-semibold flex items-center justify-between">
          <span>✓ {assignSuccess}</span>
          <button onClick={() => setAssignSuccess(null)} className="text-zinc-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Plans Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const finalPrice = discountApplied ? plan.price * (1 - discountApplied / 100) : plan.price;
          return (
            <Card
              key={plan.id}
              glow
              className={`flex flex-col justify-between p-6 relative ${
                plan.isPopular ? 'border-cyan-500/50 bg-gradient-to-b from-zinc-900 via-zinc-900 to-cyan-950/20' : ''
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-zinc-950 text-[10px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{plan.type}</span>
                  <Badge variant="cyan">{plan.durationMonths} Mo</Badge>
                </div>

                <h3 className="text-lg font-extrabold text-white mt-2">{plan.name}</h3>
                <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">{plan.description}</p>

                <div className="mt-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">${finalPrice.toFixed(0)}</span>
                    {discountApplied && <span className="text-xs text-zinc-500 line-through">${plan.price}</span>}
                    <span className="text-xs text-zinc-400 font-medium">/ {plan.durationMonths === 1 ? 'month' : `${plan.durationMonths} months`}</span>
                  </div>
                </div>

                {/* Features list */}
                <ul className="mt-4 space-y-2.5 text-xs text-zinc-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <Button
                  variant={plan.isPopular ? 'glow' : 'outline'}
                  size="sm"
                  className="w-full"
                  onClick={() => setAssigningPlan(plan)}
                >
                  Assign Membership
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Assign Membership Modal */}
      {assigningPlan && (
        <Modal
          isOpen={!!assigningPlan}
          onClose={() => setAssigningPlan(null)}
          title={`Assign Plan: ${assigningPlan.name}`}
          subtitle={`Tier Fee: $${assigningPlan.price} / ${assigningPlan.durationMonths} month(s)`}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Select Member Account
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.user?.name} ({m.user?.email}) — Current: {m.membership?.plan?.name || 'Standard'}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between text-zinc-400">
                <span>Selected Tier:</span>
                <span className="font-semibold text-white">{assigningPlan.name}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Effective Price:</span>
                <span className="font-mono text-cyan-400 font-bold">${assigningPlan.price}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Included Features:</span>
                <span className="text-zinc-300 truncate max-w-[200px]">{assigningPlan.features.slice(0, 2).join(', ')}...</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
              <Button variant="ghost" type="button" onClick={() => setAssigningPlan(null)}>
                Cancel
              </Button>
              <Button
                variant="glow"
                type="button"
                onClick={() => {
                  const targetMember = members.find((m) => m.id === selectedMemberId);
                  const memberName = targetMember?.user?.name || 'Member';

                  const now = new Date();
                  const endDate = new Date(now.getTime() + assigningPlan.durationMonths * 30 * 24 * 60 * 60 * 1000);

                  setMembers((prevMembers) =>
                    prevMembers.map((m) => {
                      if (m.id !== selectedMemberId) return m;
                      return {
                        ...m,
                        membership: {
                          id: `m-sub-${Date.now()}`,
                          memberId: m.id,
                          planId: assigningPlan.id,
                          plan: assigningPlan,
                          startDate: now.toISOString().slice(0, 10),
                          endDate: endDate.toISOString().slice(0, 10),
                          status: 'ACTIVE',
                          autoRenew: true,
                          pricePaid: assigningPlan.price,
                        },
                      };
                    })
                  );

                  setAssignSuccess(`Assigned "${assigningPlan.name}" to ${memberName} successfully!`);
                  setAssigningPlan(null);
                  setTimeout(() => setAssignSuccess(null), 5000);
                }}
              >
                Confirm Plan Assignment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Plan Modal */}
      <Modal isOpen={isAddPlanModalOpen} onClose={() => setIsAddPlanModalOpen(false)} title="Create Membership Plan Tier" subtitle="Add new pricing options to your gym CRM catalog">
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <Input label="Plan Name" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="e.g. Student Flex Pass" required />
          <Input label="Description" value={planDesc} onChange={(e) => setPlanDesc(e.target.value)} placeholder="Brief summary of target demographic" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Price ($ USD)" type="number" value={planPrice} onChange={(e) => setPlanPrice(e.target.value)} placeholder="79" required />
            <Input label="Duration (Months)" type="number" value={planDuration} onChange={(e) => setPlanDuration(e.target.value)} placeholder="1" required />
          </div>

          <Input label="Perks & Features (comma-separated)" value={planPerks} onChange={(e) => setPlanPerks(e.target.value)} placeholder="Full Access, Sauna, Free Towels" />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
            <Button variant="ghost" type="button" onClick={() => setIsAddPlanModalOpen(false)}>Cancel</Button>
            <Button variant="glow" type="submit">Publish Plan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
