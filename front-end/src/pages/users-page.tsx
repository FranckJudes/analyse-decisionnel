import React, { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, KeyRound, Search, X, CheckCircle, AlertCircle, Loader2,
} from 'lucide-react';
import UsersAdminService from '../services/usersAdminService';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: number | string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  status?: string;
}

interface UserFormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

const EMPTY_FORM: UserFormData = {
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'USER',
};

const ROLE_OPTIONS = ['USER', 'ADMIN', 'ANALYSTE', 'MANAGER'];

const STATUS_CLS: Record<string, string> = {
  ACTIVE:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  INACTIVE:  'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  SUSPENDED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// ─── Modal ────────────────────────────────────────────────────────────────────

function UserModal({
  mode, user, onClose, onSaved,
}: {
  mode: 'create' | 'edit';
  user?: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<UserFormData>(
    mode === 'edit' && user
      ? {
          username:  user.username  ?? '',
          firstName: user.firstName ?? '',
          lastName:  user.lastName  ?? '',
          email:     user.email     ?? '',
          password:  '',
          role:      user.role      ?? 'USER',
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof UserFormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || (!form.password && mode === 'create')) {
      toast.error('Email et mot de passe requis.');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, string> = { ...form };
      if (mode === 'edit') delete payload.password;
      if (mode === 'create') {
        await UsersAdminService.createUser(payload);
        toast.success('Utilisateur créé.');
      } else {
        await UsersAdminService.updateUser(user!.id, payload);
        toast.success('Utilisateur mis à jour.');
      }
      onSaved();
      onClose();
    } catch {
      toast.error('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  const fields: { key: keyof UserFormData; label: string; type?: string; required?: boolean }[] = [
    { key: 'firstName',  label: 'Prénom',             required: true  },
    { key: 'lastName',   label: 'Nom',                required: true  },
    { key: 'username',   label: "Nom d'utilisateur"                   },
    { key: 'email',      label: 'Email',     type: 'email', required: true },
    ...(mode === 'create' ? [{ key: 'password' as keyof UserFormData, label: 'Mot de passe', type: 'password', required: true }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {mode === 'create' ? 'Nouvel utilisateur' : 'Modifier l\'utilisateur'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {f.label} {f.required && <span className="text-red-400">*</span>}
              </label>
              <input
                type={f.type ?? 'text'}
                value={form[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3c50e0]"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Rôle</label>
            <select
              value={form.role}
              onChange={e => handleChange('role', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3c50e0]"
            >
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-[#3c50e0] text-white rounded-lg hover:bg-[#2f3db3] disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {mode === 'create' ? 'Créer' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export function UsersPage() {
  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [modal, setModal]           = useState<{ mode: 'create' | 'edit'; user?: User } | null>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [resettingId, setResettingId] = useState<number | string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await UsersAdminService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleDelete(user: User) {
    if (!confirm(`Supprimer ${user.firstName ?? user.email} ?`)) return;
    setDeletingId(user.id);
    try {
      await UsersAdminService.deleteUser(user.id);
      toast.success('Utilisateur supprimé.');
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch {
      toast.error('Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleResetPassword(user: User) {
    if (!confirm(`Réinitialiser le mot de passe de ${user.firstName ?? user.email} ?`)) return;
    setResettingId(user.id);
    try {
      await UsersAdminService.resetUserPassword(user.id);
      toast.success('Mot de passe réinitialisé. Un email a été envoyé.');
    } catch {
      toast.error('Erreur lors de la réinitialisation.');
    } finally {
      setResettingId(null);
    }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.email ?? '').toLowerCase().includes(q) ||
      (u.firstName ?? '').toLowerCase().includes(q) ||
      (u.lastName ?? '').toLowerCase().includes(q) ||
      (u.username ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#3c50e0] uppercase">Administration</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Gestion des utilisateurs</h1>
          <p className="text-slate-500 dark:text-slate-400">Créez, modifiez et gérez les comptes utilisateurs.</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="inline-flex items-center gap-2 rounded-lg bg-[#3c50e0] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#2f3db3] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: users.length, color: 'text-slate-900 dark:text-white' },
          { label: 'Actifs', value: users.filter(u => u.status === 'ACTIVE' || !u.status).length, color: 'text-emerald-600' },
          { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, color: 'text-[#3c50e0]' },
          { label: 'Suspendus', value: users.filter(u => u.status === 'SUSPENDED').length, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3c50e0]"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <AlertCircle className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                {['#', 'Utilisateur', 'Email', 'Rôle', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm dark:divide-slate-800 dark:bg-slate-900">
              {filtered.map((user, idx) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-4 text-xs font-semibold text-slate-400">
                    {String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3c50e0] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username ?? '—'}
                        </p>
                        {user.username && <p className="text-xs text-slate-400">@{user.username}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{user.email}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#3c50e0]/10 text-[#3c50e0]">
                      {user.role ?? 'USER'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CLS[user.status ?? 'ACTIVE'] ?? STATUS_CLS.ACTIVE}`}>
                      {user.status ?? 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setModal({ mode: 'edit', user })}
                        title="Modifier"
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-[#3c50e0] transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user)}
                        disabled={resettingId === user.id}
                        title="Réinitialiser mot de passe"
                        className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-500 hover:text-amber-600 transition-colors disabled:opacity-50"
                      >
                        {resettingId === user.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <KeyRound className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === user.id}
                        title="Supprimer"
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        {deletingId === user.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <UserModal
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={fetchUsers}
        />
      )}
    </div>
  );
}
