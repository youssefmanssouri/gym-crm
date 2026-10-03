'use client';

import React, { useState } from 'react';
import { Settings, Save, Shield, Bell, Building, Globe, Key } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

export const SettingsModule: React.FC = () => {
  const [gymName, setGymName] = useState('Apex Fitness Club & Health Center');
  const [hours, setHours] = useState('06:00 AM - 11:00 PM (Daily)');
  const [taxRate, setTaxRate] = useState('8.5');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">System & Gym Settings</h2>
          <p className="text-xs text-zinc-400 mt-1">Branding, business hours, tax rates, email notifications, and security policies.</p>
        </div>
      </div>

      <div className="max-w-3xl">
        <Card className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Building className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gym Information & Branding</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Gym Facility Name" value={gymName} onChange={(e) => setGymName(e.target.value)} required />
            <Input label="Operating Hours" value={hours} onChange={(e) => setHours(e.target.value)} />
            <Input label="Tax Rate (%)" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />

            {saved && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl">
                ✓ Settings successfully saved!
              </div>
            )}

            <div className="pt-4 flex items-center justify-end border-t border-zinc-800">
              <Button variant="primary" size="sm" type="submit" icon={<Save className="w-4 h-4" />}>
                Save Settings
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
