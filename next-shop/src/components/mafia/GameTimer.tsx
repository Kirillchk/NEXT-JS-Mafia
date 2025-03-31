// components/mafia/GameTimer.tsx
import { forwardRef, useEffect, useState, useImperativeHandle } from 'react';

export type TimerHandle = {
  reset: (phase: string) => void;
};

const GameTimer = forwardRef<TimerHandle>((props, ref) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');

  const reset = (phase: string) => {
    setTimeLeft(phase === 'day' ? 300 : 180); // 5 minutes for day, 3 for night
    setCurrentPhase(phase);
  };

  useImperativeHandle(ref, () => ({
    reset,
  }));

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-gray-800 px-4 py-2 rounded">
      <div className="text-sm text-gray-400">Phase: {currentPhase || '--'}</div>
      <div className="text-xl font-mono">{formatTime(timeLeft)}</div>
    </div>
  );
});

GameTimer.displayName = 'GameTimer';

export default GameTimer;