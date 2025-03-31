// components/mafia/PlayerList.tsx
import { useState } from 'react';

interface PlayerListProps {
  players: string[];
  myRole: string;
  recipients: string[];
  gamePhase: string;
  onToggleRecipient: (player: string, checked: boolean) => void;
  onVote: (player: string) => void;
}

export default function PlayerList({ 
  players, 
  myRole, 
  recipients, 
  gamePhase, 
  onToggleRecipient, 
  onVote 
}: PlayerListProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'vote'>('chat');

  return (
    <aside className="w-64 bg-gray-800/50 border-l border-gray-700 flex flex-col">
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'chat' ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'
          }`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'vote' ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'
          }`}
          onClick={() => setActiveTab('vote')}
        >
          Vote
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === 'chat' ? (
          <>
            <h3 className="text-sm font-medium mb-2 text-gray-300">Message to:</h3>
            {players.map((player) => (
              <div key={player} className="flex items-center">
                <input
                  type="checkbox"
                  id={`chat-${player}`}
                  checked={recipients.includes(player)}
                  onChange={(e) => onToggleRecipient(player, e.target.checked)}
                  className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`chat-${player}`} className="text-gray-200">{player}</label>
              </div>
            ))}
          </>
        ) : (
          <>
            <h3 className="text-sm font-medium mb-2 text-gray-300">Vote for:</h3>
            {players.map((player) => (
              <button
                key={player}
                onClick={() => onVote(player)}
                disabled={gamePhase === 'lobby' || myRole === 'citizen'}
                className={`w-full text-left p-2 rounded text-sm ${
                  gamePhase === 'lobby' || myRole === 'citizen'
                    ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                    : 'bg-red-700/70 hover:bg-red-700 text-white'
                }`}
              >
                {player}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="p-3 border-t border-gray-700">
        <h3 className="text-sm font-medium text-gray-300">Your Role:</h3>
        <div className={`mt-1 p-2 rounded text-center text-sm font-medium ${
          !myRole ? 'bg-gray-700/50' :
          myRole === 'mafia' ? 'bg-red-900/70' :
          myRole === 'police' ? 'bg-blue-900/70' :
          myRole === 'doctor' ? 'bg-green-900/70' : 'bg-gray-700/50'
        }`}>
          {myRole || 'Unknown'}
        </div>
      </div>
    </aside>
  );
}