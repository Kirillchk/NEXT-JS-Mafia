// components/mafia/GameLayout.tsx
import { forwardRef } from 'react';
import GameChat from './GameChat';
import PlayerList from './PlayerList';
import RoleControls from './RoleControls';
import GameTimer from './GameTimer';

interface GameLayoutProps {
  roomName: string;
  timerRef: React.RefObject<any>;
  gamePhase: string;
  messages: Array<{from: string, message: string}>;
  players: string[];
  roles: { mafia: number; police: number; doctor: number; citizen: number };
  myRole: string;
  totalPlayers: number;
  message: string;
  recipients: string[];
  onMessageChange: (msg: string) => void;
  onRecipientsChange: (recipients: string[]) => void;
  onSendMessage: () => void;
  onIncrementRole: (role: keyof Roles) => void;
  onDecrementRole: (role: keyof Roles) => void;
  onStartGame: () => void;
  onVote: (player: string) => void;
}

export type Roles = {
  mafia: number;
  police: number;
  doctor: number;
  citizen: number;
};

const GameLayout = forwardRef<HTMLDivElement, GameLayoutProps>((props, ref) => {
  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden" ref={ref}>
      {/* Left sidebar - Chat */}
      <GameChat
        messages={props.messages}
        message={props.message}
        onMessageChange={props.onMessageChange}
        onSendMessage={props.onSendMessage}
      />

      {/* Main game area */}
      <main className="flex-1 flex flex-col">
        <div className="bg-gray-800/80 p-4 border-b border-gray-700">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">Room: {props.roomName}</h1>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded text-sm ${
                props.gamePhase === 'lobby' ? 'bg-blue-600' : 
                props.gamePhase === 'day' ? 'bg-yellow-600' : 'bg-purple-600'
              }`}>
                {props.gamePhase}
              </span>
              <GameTimer ref={props.timerRef} />
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          {props.gamePhase === 'lobby' ? (
            <RoleControls
              roles={props.roles}
              totalPlayers={props.totalPlayers}
              onIncrement={props.onIncrementRole}
              onDecrement={props.onDecrementRole}
              onStart={props.onStartGame}
            />
          ) : (
            <div className="text-center">
              <h2 className="text-xl mb-4">
                {props.myRole === 'mafia' 
                  ? 'Eliminate the townsfolk!' 
                  : 'Find the mafia!'}
              </h2>
              <p>Current phase: {props.gamePhase}</p>
            </div>
          )}
        </div>
      </main>

      {/* Right sidebar - Players */}
      <PlayerList
        players={props.players}
        myRole={props.myRole}
        recipients={props.recipients}
        gamePhase={props.gamePhase}
        onToggleRecipient={(player, checked) => {
          const newRecipients = checked 
            ? [...props.recipients, player]
            : props.recipients.filter(p => p !== player);
          props.onRecipientsChange(newRecipients);
        }}
        onVote={props.onVote}
      />
    </div>
  );
});

GameLayout.displayName = 'GameLayout';

export default GameLayout;