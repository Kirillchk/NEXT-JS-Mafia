// hooks/useMafiaGame.ts
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

type Roles = {
  mafia: number;
  police: number;
  doctor: number;
  citizen: number;
};

export const useMafiaGame = (roomName: string, timerRef: React.RefObject<any>) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [gamePhase, setGamePhase] = useState('lobby');
  const [myRole, setMyRole] = useState('');
  const [roles, setRoles] = useState<Roles>({
    mafia: 2,
    police: 1,
    doctor: 1,
    citizen: 2,
  });

  const totalPlayers = Object.values(roles).reduce((sum, count) => sum + count, 0);

  const handleIncrement = (role: keyof Roles) => {
    if (totalPlayers < 6) {
      setRoles(prev => ({ ...prev, [role]: prev[role] + 1 }));
    }
  };

  const handleDecrement = (role: keyof Roles) => {
    if (roles[role] > 0) {
      setRoles(prev => ({ ...prev, [role]: prev[role] - 1 }));
    }
  };

  const startGame = () => {
    socket?.emit('start', { roles });
  };

  const voteForPlayer = (player: string) => {
    if (myRole === 'citizen') return;
    socket?.emit('vote', {
      from: localStorage.getItem('userNickname'),
      against: player
    });
  };

  useEffect(() => {
    const username = localStorage.getItem('userNickname');
    const password = localStorage.getItem('userPassword');
    
    const gameSocket = io(`http://localhost:3000/room${roomName}`, {
      auth: { username, password }
    });

    gameSocket.on('connect', () => {
      console.log('Connected to game server');
    });

    gameSocket.on('player list update', (data) => {
      setPlayers(data.users.filter((user: string) => user !== username));
    });

    gameSocket.on('next', (phase) => {
      timerRef.current?.reset(phase);
      setGamePhase(phase);
    });

    gameSocket.on('start', () => {
      timerRef.current?.reset('day');
      setGamePhase('day');
    });

    setSocket(gameSocket);

    return () => {
      gameSocket.disconnect();
    };
  }, [roomName]);

  return {
    players,
    roles,
    gamePhase,
    myRole,
    totalPlayers,
    handleIncrement: handleIncrement as (role: keyof Roles) => void,
    handleDecrement: handleDecrement as (role: keyof Roles) => void,
    startGame,
    voteForPlayer,
  };
};