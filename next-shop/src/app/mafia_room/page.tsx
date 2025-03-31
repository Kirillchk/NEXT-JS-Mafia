// app/mafia_room/page.tsx
'use client'
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import GameLayout from '@/components/mafia/GameLayout';
import { useMafiaGame } from '@/hooks/useMafiaGame';
import { useMafiaChat } from '@/hooks/useMafiaChat';

export default function MafiaRoomPage() {
  const searchParams = useSearchParams();
  const roomName = searchParams.get('utm_room') || '';
  const timerRef = useRef<{ reset: (arg: string) => void }>(null);

  const {
    players,
    roles,
    gamePhase,
    myRole,
    totalPlayers,
    handleIncrement,
    handleDecrement,
    startGame,
    voteForPlayer,
  } = useMafiaGame(roomName, timerRef);

  const {
    messages,
    recipients,
    message,
    setMessage,
    setRecipients,
    sendMessage,
  } = useMafiaChat(roomName);

  return (
    <GameLayout
      roomName={roomName}
      timerRef={timerRef}
      gamePhase={gamePhase}
      messages={messages}
      players={players}
      roles={roles}
      myRole={myRole}
      totalPlayers={totalPlayers}
      message={message}
      recipients={recipients}
      onMessageChange={setMessage}
      onRecipientsChange={setRecipients}
      onSendMessage={sendMessage}
      onIncrementRole={handleIncrement}
      onDecrementRole={handleDecrement}
      onStartGame={startGame}
      onVote={voteForPlayer}
    />
  );
}