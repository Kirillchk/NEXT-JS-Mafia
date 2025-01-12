"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

// Define the socket type
let socket: Socket;

const Home = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket = io("http://localhost:3000");
    socket.on("connect", () => {
      console.log("Connected to WebSocket server!");
    });
    socket.on("message", (message: string) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("message", input);
      setInput("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>WebSocket Example</h1>
      <div>
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Home;
