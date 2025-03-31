// components/mafia/GameChat.tsx
import { useState } from 'react';

interface GameChatProps {
  messages: Array<{from: string, message: string}>;
  message: string;
  onMessageChange: (msg: string) => void;
  onSendMessage: () => void;
}

export default function GameChat({ 
  messages, 
  message, 
  onMessageChange, 
  onSendMessage 
}: GameChatProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <aside className={`w-64 bg-gray-800/50 border-r border-gray-700 flex flex-col ${isMinimized ? 'w-12' : ''}`}>
      <div className="p-3 border-b border-gray-700 flex justify-between items-center">
        {!isMinimized && <h2 className="font-semibold">Chat</h2>}
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-gray-400 hover:text-white"
        >
          {isMinimized ? '>' : '<'}
        </button>
      </div>
      
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className="break-words">
                <span className="font-semibold text-blue-400">{msg.from}:</span>
                <span className="ml-2 text-gray-200">{msg.message}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-700">
            <div className="flex rounded-md overflow-hidden">
              <input
                type="text"
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                className="flex-1 bg-gray-700 px-3 py-2 focus:outline-none"
                placeholder="Type a message..."
              />
              <button
                onClick={onSendMessage}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2"
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}