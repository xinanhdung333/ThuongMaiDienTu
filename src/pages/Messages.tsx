import React from 'react';
import Chat from './Chat';

export const Messages: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Tin nhắn</h1>
      <Chat />
    </div>
  );
};

export default Messages;
