import React, { useState } from 'react';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<{ id: string; from: string; text: string }[]>([
    { id: 'm1', from: 'System', text: 'Đây là hộp chat mẫu. Tính năng chat thực tế cần backend.' }
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: String(Date.now()), from: 'You', text: input }]);
    setInput('');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Tin nhắn / Hỗ trợ</h1>
      <div className="border rounded p-3 h-96 overflow-y-auto bg-white">
        {messages.map(m => (
          <div key={m.id} className={`mb-2 ${m.from === 'You' ? 'text-right' : 'text-left'}`}>
            <div className="inline-block rounded px-3 py-1 bg-gray-100">{m.text}</div>
            <div className="text-xs text-gray-400">{m.from}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input className="flex-1 border rounded px-3 py-2" value={input} onChange={e => setInput(e.target.value)} placeholder="Gõ tin nhắn..." />
        <button className="bg-blue-600 text-white px-4 rounded" onClick={send}>Gửi</button>
      </div>
    </div>
  );
};

export default Chat;
