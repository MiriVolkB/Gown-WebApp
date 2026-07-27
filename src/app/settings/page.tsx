'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Loader2,
  Plus,
  Pencil,
  Check,
  X,
  Eye,
  EyeOff,
  UserPlus,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const deepNavy = '#1E2024';

type Service = {
  id: number;
  name: string;
  defaultDurationMin: number;
  color: string | null;
  active: boolean;
};

type AccountUser = {
  id: string;
  username: string;
  role: string;
  createdAt: string;
};

const ROLE_OPTIONS = ['OWNER', 'SECRETARY', 'GUEST'] as const;

const PRESET_COLORS = [
  '#3b82f6',
  '#f59e0b',
  '#8b5cf6',
  '#10b981',
  '#ec4899',
  '#64748b',
  '#ef4444',
  '#0F172A',
];

export default function SettingsPage() {
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(true);

  useEffect(() => {
    fetch('/api/account')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setAccount(data))
      .catch(() => setAccount(null))
      .finally(() => setLoadingAccount(false));
  }, []);

  const isOwner = account?.role === 'OWNER';
  const canEditServices = account?.role === 'OWNER';
  const isGuest = account?.role === 'GUEST';

  if (loadingAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-7 h-7 animate-spin mb-3" />
        <span className="text-sm tracking-wide">Loading settings…</span>
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="relative min-h-[calc(100dvh-8rem)] rounded-2xl overflow-hidden">
        {/* Locked preview — still readable under the overlay */}
        <div className="pointer-events-none select-none" aria-hidden>
          <div className="mb-8">
            <h1
              className="text-4xl font-light tracking-wide"
              style={{ color: deepNavy, fontFamily: "'Playfair Display', serif" }}
            >
              Settings
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-xl">
              Manage appointment services, your account, and who can access the studio.
            </p>
          </div>

          <div className="inline-flex gap-1 p-1 mb-6 bg-slate-100 rounded-xl">
            {['Services', 'Account', 'Users'].map((label) => (
              <span
                key={label}
                className={`px-4 py-2 text-sm rounded-lg ${
                  label === 'Services'
                    ? 'bg-white shadow-sm font-medium text-slate-900'
                    : 'text-slate-500'
                }`}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 md:px-6 border-b border-slate-100">
              <p className="text-lg font-semibold text-slate-900">Appointment services</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Types shown when booking — name, duration, and calendar color.
              </p>
            </div>
            <ul className="divide-y divide-slate-100">
              {[
                { name: 'First Appointment', color: '#3b82f6', mins: 30 },
                { name: 'First Fitting', color: '#f59e0b', mins: 45 },
                { name: 'Second Fitting', color: '#8b5cf6', mins: 45 },
                { name: 'Pickup', color: '#10b981', mins: 20 },
                { name: 'Rental', color: '#ec4899', mins: 30 },
              ].map((s) => (
                <li key={s.name} className="px-5 py-4 md:px-6 flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <div>
                    <p className="font-medium text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.mins} min default</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-200/35 backdrop-blur-[1px] p-6">
          <div className="max-w-sm w-full text-center bg-white/95 border border-slate-200 rounded-2xl shadow-lg px-7 py-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#1E2024]" strokeWidth={1.75} />
            </div>
            <h2
              className="text-2xl font-light tracking-wide text-[#1E2024]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Settings aren&apos;t available
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Guest mode is for exploring demo data only. Settings stay locked to protect the studio
              and prevent real account changes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-8rem)]">
      <div className="mb-8">
        <h1
          className="text-4xl font-light tracking-wide"
          style={{ color: deepNavy, fontFamily: "'Playfair Display', serif" }}
        >
          Settings
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-xl">
          Manage appointment services, your account, and who can access the studio.
        </p>
      </div>

      <Tabs defaultValue="services" className="gap-6">
        <TabsList className="bg-slate-100 h-auto p-1 rounded-xl flex-wrap w-full sm:w-auto">
          <TabsTrigger
            value="services"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Services
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Account
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger
              value="users"
              className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Users
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="services">
          <ServicesSection canEdit={!!canEditServices} isGuest={!!isGuest} />
        </TabsContent>

        <TabsContent value="account">
          <AccountSection account={account} isGuest={!!isGuest} />
        </TabsContent>

        {isOwner && (
          <TabsContent value="users">
            <UsersSection currentUserId={account?.id} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function ServicesSection({ canEdit, isGuest }: { canEdit: boolean; isGuest: boolean }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState({
    name: '',
    defaultDurationMin: 30,
    color: '#3b82f6',
    active: true,
  });
  const [adding, setAdding] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    defaultDurationMin: 30,
    color: '#3b82f6',
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load services'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (s: Service) => {
    setEditingId(s.id);
    setDraft({
      name: s.name,
      defaultDurationMin: s.defaultDurationMin,
      color: s.color || '#3b82f6',
      active: s.active,
    });
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/services/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      toast.success(isGuest ? 'Demo mode — change not saved' : 'Service updated');
      setEditingId(null);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const createService = async () => {
    if (!newService.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      toast.success(isGuest ? 'Demo mode — change not saved' : 'Service created');
      setAdding(false);
      setNewService({ name: '', defaultDurationMin: 30, color: '#3b82f6' });
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: Service) => {
    if (!canEdit) return;
    try {
      const res = await fetch(`/api/services/${s.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !s.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      toast.success(
        isGuest
          ? 'Demo mode — change not saved'
          : s.active
            ? 'Service deactivated'
            : 'Service activated'
      );
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update');
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Appointment services</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Types shown when booking — name, duration, and calendar color.
          </p>
        </div>
        {canEdit && (
          <Button
            onClick={() => setAdding(true)}
            className="h-10 px-4 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: deepNavy, color: 'white' }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add service
          </Button>
        )}
      </div>

      {!canEdit && (
        <p className="px-5 md:px-6 py-3 text-xs text-slate-500 bg-slate-50 border-b border-slate-100">
          Only owners can edit services. You can still view them here.
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {adding && (
            <li className="px-5 py-4 md:px-6 bg-slate-50/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-slate-500">Name</Label>
                  <Input
                    value={newService.name}
                    onChange={(e) => setNewService((s) => ({ ...s, name: e.target.value }))}
                    placeholder="e.g. Final Fitting"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Duration (min)</Label>
                  <Input
                    type="number"
                    min={5}
                    value={newService.defaultDurationMin}
                    onChange={(e) =>
                      setNewService((s) => ({
                        ...s,
                        defaultDurationMin: Number(e.target.value) || 30,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Color</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={newService.color}
                      onChange={(e) => setNewService((s) => ({ ...s, color: e.target.value }))}
                      className="h-9 w-12 rounded border border-slate-200 cursor-pointer bg-white"
                    />
                    <div className="flex flex-wrap gap-1">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewService((s) => ({ ...s, color: c }))}
                          className="w-5 h-5 rounded-full border border-slate-200"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={createService}
                  disabled={saving}
                  style={{ backgroundColor: deepNavy, color: 'white' }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span className="ml-1">Save</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAdding(false)}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </li>
          )}

          {services.map((s) => (
            <li key={s.id} className={`px-5 py-4 md:px-6 ${!s.active ? 'opacity-60' : ''}`}>
              {editingId === s.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs text-slate-500">Name</Label>
                      <Input
                        value={draft.name}
                        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Duration (min)</Label>
                      <Input
                        type="number"
                        min={5}
                        value={draft.defaultDurationMin}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            defaultDurationMin: Number(e.target.value) || 30,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Color</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="color"
                          value={draft.color}
                          onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))}
                          className="h-9 w-12 rounded border border-slate-200 cursor-pointer bg-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={saveEdit}
                      disabled={saving}
                      style={{ backgroundColor: deepNavy, color: 'white' }}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span className="ml-1">Save</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: s.color || '#64748b' }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {s.name}
                        {!s.active && (
                          <span className="ml-2 text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                            Inactive
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{s.defaultDurationMin} min default</p>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => startEdit(s)}
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => toggleActive(s)}
                        title={s.active ? 'Deactivate' : 'Activate'}
                      >
                        {s.active ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}

          {services.length === 0 && !adding && (
            <li className="px-5 py-12 text-center text-sm text-slate-400">
              No services yet. Add your first appointment type.
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

function AccountSection({
  account,
  isGuest,
}: {
  account: AccountUser | null;
  isGuest: boolean;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      toast.success(isGuest ? 'Demo mode — change not saved' : 'Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Your profile</h2>
        <p className="text-sm text-slate-500 mt-0.5 mb-5">Signed-in account details.</p>
        <dl className="space-y-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
              Username
            </dt>
            <dd className="mt-1 text-slate-900 font-medium">{account?.username ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Role</dt>
            <dd className="mt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-sm font-medium text-slate-700">
                <Shield className="w-3.5 h-3.5" />
                {account?.role ?? '—'}
              </span>
            </dd>
          </div>
          {account?.createdAt && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                Member since
              </dt>
              <dd className="mt-1 text-slate-700 text-sm">
                {format(new Date(account.createdAt), 'MMMM d, yyyy')}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
        <p className="text-sm text-slate-500 mt-0.5 mb-5">
          Use a strong password you don’t reuse elsewhere.
        </p>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1"
              minLength={6}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1"
              minLength={6}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="h-10 px-5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: deepNavy, color: 'white' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Update password
          </Button>
        </form>
      </section>
    </div>
  );
}

function UsersSection({ currentUserId }: { currentUserId?: string }) {
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'SECRETARY' as (typeof ROLE_OPTIONS)[number],
  });

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createUser = async () => {
    if (!form.username.trim() || !form.password) {
      toast.error('Username and password are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      toast.success('User created');
      setAdding(false);
      setForm({ username: '', password: '', role: 'SECRETARY' });
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const updateRole = async (id: string, role: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role');
      toast.success('Role updated');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update role');
    }
  };

  const resetPassword = async (id: string, username: string) => {
    const password = window.prompt(`New password for ${username} (min 6 characters):`);
    if (!password) return;
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      toast.success('Password reset');
    } catch (e: any) {
      toast.error(e.message || 'Failed to reset password');
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 md:px-6 md:py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Team access</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Owners see finances. Secretaries manage clients and calendar. Guests are demo-only.
          </p>
        </div>
        <Button
          onClick={() => setAdding(true)}
          className="h-10 px-4 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: deepNavy, color: 'white' }}
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Add user
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {adding && (
            <li className="px-5 py-4 md:px-6 bg-slate-50/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-slate-500">Username</Label>
                  <Input
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Password</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="mt-1"
                    minLength={6}
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Role</Label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        role: e.target.value as (typeof ROLE_OPTIONS)[number],
                      }))
                    }
                    className="mt-1 w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={createUser}
                  disabled={saving}
                  style={{ backgroundColor: deepNavy, color: 'white' }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span className="ml-1">Create</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAdding(false)} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </li>
          )}

          {users.map((u) => (
            <li
              key={u.id}
              className="px-5 py-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {u.username}
                  {u.id === currentUserId && (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                      You
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  Joined {format(new Date(u.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u.id, e.target.value)}
                  disabled={u.id === currentUserId}
                  className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm disabled:opacity-60"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resetPassword(u.id, u.username)}
                  className="text-xs"
                >
                  Reset password
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
