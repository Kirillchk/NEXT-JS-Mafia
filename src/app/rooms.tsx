"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";

interface Room {
	_id: object
	roomname: string;
	online: number;
}
var socket: Socket;

const Home = () => {
	const [getRoomName, setRoomName] = useState<string>("");
	const [getMaxPlayers, setMaxPlayers] = useState<string>("5");
	const [getVisible, setVisible] = useState<boolean>(false);

	const createRoom = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault(); // Prevents default form behavior
		console.log('creating room')
		const data = {
			roomname: getRoomName,
			userName: localStorage.getItem("userNickname"),
			JWT: localStorage.getItem('JWT')
		}
		socket.emit("createroom", data)
		console.log('created room', data)
	}

	return (
		<div className="flex-row ">
			<p>vvv All Rooms vvv</p>
			<RoomsElement />
			<button onClick={() => setVisible(!getVisible)}>Add Room</button>
			{getVisible && (
				<form className="flex flex-col" onSubmit={createRoom}>
					<input
						type="text"
						required
						onChange={(e) => setRoomName(e.target.value)}
						value={getRoomName}
						placeholder="Room name"
						className="block bg-gray-400/50"
					/>
					<div className="flex ">
						<input
							className="flex w-full"
							type="range"
							min="1"
							max="10"
							step="1"
							value={getMaxPlayers}
							onChange={(e) => setMaxPlayers(e.target.value)}
						/>
						<label className="w-2">{getMaxPlayers.toString()}</label>
					</div>
					<input type="submit" value="submit" className="bg-gray-400/50" />
				</form>
			)}
		</div>
	);
};

const RoomsElement = () => {
	const [getRooms, setRooms] = useState<Map<string, Room>>(new Map());
	useEffect(() => {
		async function fetchRooms() {
			const res = await fetch("/api/allrooms");
			const data = await res.json();
			const updatedMap = new Map<string, Room>(Object.entries(data));
			setRooms(updatedMap);
		}
		fetchRooms();
		socket = socket||io("http://localhost:3000");
		socket.on("connect", () => {
			console.log("Connected to WebSocket server!");
		});
		socket.on("room_created", (message: { key: string; room: Room }) => {
			console.log("room created triggered")
			setRooms((prev) => {
				console.log('updating rooms', message)
				const updatedMap = new Map(prev);
				updatedMap.set(message.key, message.room)
				return updatedMap
			});
		});
		socket.on("deleteroom", (message: { ID: string; }) => {
			console.log("deleteroom triggered")
			setRooms((prev) => {
				console.log('deleting')
				const updatedMap = new Map(prev);
				updatedMap.delete(message.ID);
				return updatedMap;
			});
		});
	}, []);
	return (
		<div className="grid gap-2 bg-gray-400/50">
			{[...getRooms.entries()].map(([key, room]) => (
				(
					<div
						key={key}
						className="w-auto mx-auto flex justify-around items-center"
					>
						<Link
							href={`/mafia_room?utm_room=${room.roomname}`}
							className="inline px-5"
						>
							{room.roomname}
						</Link>
						<div className="inline px-5">
							{room.online}/15
						</div>
					</div>
				) 
			))}
		</div>
	);
};

export default Home;
