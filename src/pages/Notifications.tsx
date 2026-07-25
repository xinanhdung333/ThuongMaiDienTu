import React from 'react';
import { db } from '@/services/mockDb';

export const Notifications: React.FC = () => {
  // internal key in mockDb is 'lumina_notifications'
  const notes = db.get<any[]>('lumina_notifications');

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Thông báo</h1>
      <div className="space-y-3">
        {notes.map(n => (
          <div key={n.id} className={`p-3 rounded border ${n.is_read ? 'bg-white' : 'bg-yellow-50'}`}>
            <div className="font-semibold">{n.title}</div>
            <div className="text-sm text-gray-600">{n.content}</div>
            <div className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
