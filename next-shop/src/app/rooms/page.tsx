"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";

interface Room {
  _id: object;
  roomname: string;
  online: number;
}

let socket: Socket;

export default function RoomsPage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [rooms, setRooms] = useState<Record<string, Room>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/allrooms");
        if (!res.ok) throw new Error("Failed to fetch rooms");
        const data = await res.json();
        setRooms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load rooms");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();

    socket = socket || io("http://localhost:3000");
    socket.on("room_created", (message: { key: string; room: Room }) => {
      setRooms(prev => ({ ...prev, [message.key]: message.room }));
    });
    socket.on("deleteroom", (message: { ID: string }) => {
      setRooms(prev => {
        const newRooms = { ...prev };
        delete newRooms[message.ID];
        return newRooms;
      });
    });

    return () => {
      socket.off("room_created");
      socket.off("deleteroom");
    };
  }, []);

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    try {
      const data = {
        roomname: roomName,
        userName: localStorage.getItem("userNickname"),
        JWT: localStorage.getItem("JWT")
      };
      socket.emit("createroom", data);
      setRoomName("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading rooms...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Available Rooms</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          {showForm ? "Cancel" : "Create Room"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createRoom} className="bg-white/10 p-6 rounded-lg mb-8">
          <div className="mb-4">
            <label className="block mb-2">Room Name</label>
            <input
              type="text"
              required
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded"
              placeholder="Enter room name"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Max Players: {maxPlayers}</label>
            <input
              type="range"
              min="5"
              max="15"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Create Room
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {Object.entries(rooms).map(([key, room]) => (
          <div
            key={key}
            className="bg-white/10 hover:bg-white/20 p-4 rounded-lg transition cursor-pointer"
            onClick={() => router.push(`/mafia_room?utm_room=${room.roomname}`)}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">{room.roomname}</h3>
              <span className="bg-green-600 px-3 py-1 rounded-full text-sm">
                {room.online}/{maxPlayers} players
              </span>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(rooms).length === 0 && !showForm && (
        <div className="text-center py-8">
          No rooms available. Create one to get started!
        </div>
      )}
    </div>
  );
}