import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Users, UserPlus, Trash2, Edit, RefreshCw, Save, X,
  Home, ChevronRight, Plus, Key, CheckCircle, XCircle, UserMinus
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs } from '../components/ui/tabs';
import toast from 'react-hot-toast';
import GroupeService from '../services/groupeService';
import UsersAdminService from '../services/usersAdminService';

function UserModal({ show, onClose, editMode, user, onChange, onSave }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {editMode ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Prénom *</label>
              <input name="firstName" value={user.firstName} onChange={onChange} required
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Nom *</label>
              <input name="lastName" value={user.lastName} onChange={onChange} required
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Email *</label>
            <input name="email" type="email" value={user.email} onChange={onChange} required
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {!editMode && (
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Mot de passe *</label>
              <input name="password" type="password" value={user.password} onChange={onChange} required={!editMode}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Rôle</label>
            <select name="role" value={user.role} onChange={onChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="USER">Utilisateur</option>
              <option value="ADMIN">Administrateur</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" name="active" checked={user.active} onChange={onChange}
              className="w-4 h-4 text-blue-600 rounded border-slate-300" />
            <label htmlFor="active" className="text-sm text-slate-700 dark:text-slate-300">Compte actif</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="primary" size="sm">
              <Save className="h-4 w-4" /> {editMode ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UsersTab({ onRefresh }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: null, firstName: '', lastName: '', email: '', password: '', role: 'USER', active: true });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await UsersAdminService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const openModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setEditMode(true);
    } else {
      setCurrentUser({ id: null, firstName: '', lastName: '', email: '', password: '', role: 'USER', active: true });
      setEditMode(false);
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentUser((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveUser = async () => {
    try {
      if (editMode) {
        await UsersAdminService.updateUser(currentUser.id, currentUser);
        toast.success('Utilisateur mis à jour');
      } else {
        await UsersAdminService.createUser(currentUser);
        toast.success('Utilisateur créé');
      }
      setShowModal(false);
      loadUsers();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await UsersAdminService.deleteUser(id);
      toast.success('Utilisateur supprimé');
      loadUsers();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetPassword = async (id) => {
    if (!confirm('Réinitialiser le mot de passe de cet utilisateur ?')) return;
    try {
      await UsersAdminService.resetUserPassword(id);
      toast.success('Mot de passe réinitialisé');
    } catch {
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">Gérez les comptes utilisateurs</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </Button>
          <Button variant="primary" size="sm" onClick={() => openModal()}>
            <UserPlus className="h-4 w-4" /> Ajouter
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-slate-400" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {['Nom', 'Email', 'Rôle', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.active ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="h-3 w-3" /> Actif</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 text-xs"><XCircle className="h-3 w-3" /> Inactif</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openModal(user)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600" title="Modifier">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => resetPassword(user.id)} className="p-1.5 rounded hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600" title="Réinitialiser le mot de passe">
                        <Key className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteUser(user.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600" title="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Aucun utilisateur trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <UserModal show={showModal} onClose={() => setShowModal(false)} editMode={editMode}
        user={currentUser} onChange={handleChange} onSave={saveUser} />
    </div>
  );
}

function GroupsTab() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', description: '' });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const [usersWithoutGroup, setUsersWithoutGroup] = useState([]);
  const [showUserPanel, setShowUserPanel] = useState(false);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await GroupeService.getAllGroups();
      setGroups(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupUsers = async (group) => {
    setSelectedGroup(group);
    try {
      const [inGroup, withoutGroup] = await Promise.all([
        GroupeService.getUsersInGroup(group.id),
        GroupeService.getUsersWithoutGroup(),
      ]);
      setGroupUsers(Array.isArray(inGroup) ? inGroup : []);
      setUsersWithoutGroup(Array.isArray(withoutGroup) ? withoutGroup : []);
      setShowUserPanel(true);
    } catch {
      toast.error('Erreur lors du chargement des membres');
    }
  };

  useEffect(() => { loadGroups(); }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveGroup = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Le libellé est requis'); return; }
    try {
      const payload = { libeleGroupeUtilisateur: form.name, descriptionGroupeUtilisateur: form.description };
      if (editMode) {
        await GroupeService.updateGroup(form.id, payload);
        toast.success('Groupe mis à jour');
      } else {
        await GroupeService.createGroup(payload);
        toast.success('Groupe créé');
      }
      setForm({ id: null, name: '', description: '' });
      setEditMode(false);
      loadGroups();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const editGroup = (group) => {
    setForm({ id: group.id, name: group.libeleGroupeUtilisateur, description: group.descriptionGroupeUtilisateur || '' });
    setEditMode(true);
  };

  const deleteGroup = async (id) => {
    if (!confirm('Supprimer ce groupe ?')) return;
    try {
      await GroupeService.deleteGroup(id);
      toast.success('Groupe supprimé');
      loadGroups();
      if (selectedGroup?.id === id) setShowUserPanel(false);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const removeUserFromGroup = async (userId) => {
    if (!selectedGroup) return;
    try {
      await GroupeService.removeUserFromGroup(selectedGroup.id, userId);
      toast.success('Utilisateur retiré du groupe');
      loadGroupUsers(selectedGroup);
    } catch {
      toast.error('Erreur lors du retrait');
    }
  };

  const addUserToGroup = async (userId) => {
    if (!selectedGroup) return;
    try {
      await GroupeService.addUsersToGroup(selectedGroup.id, [userId]);
      toast.success('Utilisateur ajouté au groupe');
      loadGroupUsers(selectedGroup);
    } catch {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Form */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {editMode ? 'Modifier le groupe' : 'Ajouter un groupe'}
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveGroup} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Libellé *</label>
                  <input name="name" value={form.name} onChange={handleChange} required
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setForm({ id: null, name: '', description: '' }); setEditMode(false); }}>
                    {editMode ? 'Annuler' : 'Réinitialiser'}
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    <Save className="h-4 w-4" /> {editMode ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Groups list */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Liste des groupes</h3>
                <Button variant="outline" size="sm" onClick={loadGroups} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-6"><RefreshCw className="h-6 w-6 animate-spin text-slate-400" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        {['Libellé', 'Description', 'Actions'].map((h) => (
                          <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500 tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {groups.map((g) => (
                        <tr key={g.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer ${selectedGroup?.id === g.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                          onClick={() => loadGroupUsers(g)}>
                          <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-white">{g.libeleGroupeUtilisateur}</td>
                          <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400 text-xs">{g.descriptionGroupeUtilisateur || '–'}</td>
                          <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <button onClick={() => editGroup(g)} className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600" title="Modifier">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button onClick={() => deleteGroup(g.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600" title="Supprimer">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {groups.length === 0 && (
                        <tr><td colSpan={3} className="px-3 py-6 text-center text-slate-400">Aucun groupe</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Group users panel */}
      {showUserPanel && selectedGroup && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Membres du groupe : <span className="text-blue-600">{selectedGroup.libeleGroupeUtilisateur}</span>
              </h3>
              <button onClick={() => setShowUserPanel(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Membres actuels</h4>
                <div className="space-y-2">
                  {groupUsers.length === 0 ? (
                    <p className="text-sm text-slate-400">Aucun membre dans ce groupe</p>
                  ) : groupUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                      <span className="text-sm text-slate-900 dark:text-white">{user.firstName} {user.lastName}</span>
                      <button onClick={() => removeUserFromGroup(user.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Retirer">
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Utilisateurs sans groupe</h4>
                <div className="space-y-2">
                  {usersWithoutGroup.length === 0 ? (
                    <p className="text-sm text-slate-400">Tous les utilisateurs sont dans un groupe</p>
                  ) : usersWithoutGroup.map((user) => (
                    <div key={user.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                      <span className="text-sm text-slate-900 dark:text-white">{user.firstName} {user.lastName}</span>
                      <button onClick={() => addUserToGroup(user.id)} className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" title="Ajouter">
                        <UserPlus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function GroupManagementPage() {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'Utilisateurs', icon: <Users className="h-4 w-4" /> },
    { id: 'groups', label: 'Groupes', icon: <UserPlus className="h-4 w-4" /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200">
            <Home className="h-4 w-4" /> Accueil
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
            <Users className="h-4 w-4" /> Gestion des utilisateurs et groupes
          </span>
        </nav>

        <Card>
          <CardHeader>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Utilisateurs & Groupes
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Gérez les comptes utilisateurs et les groupes de l'application
            </p>
          </CardHeader>
          <div className="px-6">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>
          <CardContent>
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'groups' && <GroupsTab />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
