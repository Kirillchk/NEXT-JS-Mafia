// hooks/useMafiaChat.ts
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export const useMafiaChat = (roomName: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Array<{from: string, message: string}>>([]);
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);

  const sendMessage = () => {
    if (!message.trim() || !socket?.connected) return;
    
    socket.emit('message', {
      from: localStorage.getItem('userNickname'),
      message,
      to: recipients,
      JWT: localStorage.getItem('JWT'),
    });
    setMessage('');
  };

  const toggleRecipient = (player: string, isChecked: boolean) => {
    setRecipients(prev => 
      isChecked ? [...prev, player] : prev.filter(p => p !== player)
    );
  };

  useEffect(() => {
    const username = localStorage.getItem('userNickname');
    if (!username) return;

    const chatSocket = io(`http://localhost:3000/${roomName}/${username}`);

    chatSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    chatSocket.on('message_recived', (data) => {
      setMessages(prev => [...prev, data]);
    });

    chatSocket.on('assignrole', (role) => {
      console.log('Assigned role:', role);
    });

    setSocket(chatSocket);
    setRecipients([username]);

    return () => {
      chatSocket.disconnect();
    };
  }, [roomName]);

  return {
    messages,
    message,
    recipients,
    setMessage,
    setRecipients,
    sendMessage,
    toggleRecipient,
  };
};