import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { User, UserRole } from '@/types';
import { useAuthStore } from '@/store/authStore';

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'customers' | 'sellers'>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const load = () => {
    api.users.getAll().then((all) => {
      let list = all;
      if (filter === 'customers') list = all.filter(u => !u.roles.includes('Seller'));
      else if (filter === 'sellers') list = all.filter(u => u.roles.includes('Seller'));
      if (query && query.trim().length > 0) {
        const q = query.trim().toLowerCase();
        list = list.filter(u => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      setUsers(list);
    }).catch(() => setUsers([]));
  };

  useEffect(() => load(), []);

  const initialize = useAuthStore(state => state.initialize);

  const toggleRole = (userId: string, role: UserRole) => {
    const u = users.find(x => x.user_id === userId);
    if (!u) return;
    const has = u.roles.includes(role);
    (has ? api.users.removeRole(userId, role) : api.users.assignRole(userId, role))
      .then(() => {
        load();
        initialize();
      })
      .catch(() => {
        // noop
      });
  };

  const toggleBlock = (userId: string) => {
    const u = users.find(x => x.user_id === userId);
    if (!u) return;
    const next = u.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    api.users.update(userId, { status: next as any }).then(() => {
      load();
      initialize();
    }).catch(() => {});
  };

  const deleteUser = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will mark the account as deleted.')) return;
    api.users.remove(userId).then(() => load()).catch(() => {});
  };

  useEffect(() => load(), [filter]);

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl">
      <h2 className="font-bold mb-3">Manage Users</h2>
      <div className="mb-3 flex items-center gap-2">
        <label className="text-sm">Filter:</label>
        <select value={filter} onChange={e => setFilter(e.target.value as any)} className="text-sm border rounded px-2 py-1">
          <option value="all">All</option>
          <option value="customers">Customers</option>
          <option value="sellers">Sellers</option>
        </select>
        <input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Search name or email" className="ml-3 px-2 py-1 border rounded text-sm flex-1" />
      </div>

      <div className="space-y-2">
        {users.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE).map(u => (
          <div key={u.user_id} className="flex items-center justify-between p-2 border rounded">
            <div>
              <div className="font-semibold">{u.full_name}</div>
              <div className="text-xs text-slate-400">{u.email}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs px-2 py-1 rounded bg-slate-50 dark:bg-slate-800">{u.roles.join(', ')}</div>
              <button onClick={() => toggleRole(u.user_id, 'Seller')} className="px-2 py-1 rounded border text-xs">{u.roles.includes('Seller') ? 'Revoke Seller' : 'Make Seller'}</button>
              <button onClick={() => toggleRole(u.user_id, 'Admin')} className="px-2 py-1 rounded border text-xs">{u.roles.includes('Admin') ? 'Revoke Admin' : 'Make Admin'}</button>
              <button onClick={() => toggleBlock(u.user_id)} className="px-2 py-1 rounded border text-xs text-rose-600">{u.status === 'BLOCKED' ? 'Unblock' : 'Block'}</button>
              <button onClick={() => deleteUser(u.user_id)} className="px-2 py-1 rounded border text-xs text-rose-800">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-500">Showing {Math.min(users.length, page*PAGE_SIZE) - (page-1)*PAGE_SIZE} of {users.length}</div>
        <div className="flex items-center gap-2">
          <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 border rounded">Prev</button>
          <div className="px-2">{page}</div>
          <button disabled={page*PAGE_SIZE >= users.length} onClick={() => setPage(p => p+1)} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
