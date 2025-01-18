"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";

interface Room {
	name: string;
	password: boolean;
	onlineCount: number;
	onlineMax: number;
} 
let socket: Socket

const Home = () => {
	const [getRooms, setRooms] = useState<Map<string, Room>>(new Map());
	const [getDefaultvalue, setDefaultValue] = useState<string>()
	const [getBool, setBool] = useState<boolean>(true)
	const createRoom = async () => {

	} 
	useEffect(() => {
		async function fetchRooms() {
			const res = await fetch("http://localhost:3000/api/allrooms");
			const data = await res.json();

			const updatedMap = new Map<string, Room>(
				Object.entries(data) 
			);
			setRooms(updatedMap);
		}

		fetchRooms();
		socket = io("http://localhost:3000");
		socket.on("connect", () => {
			console.log("Connected to WebSocket server!");
		});
		socket.on("createroom", (message: { key: string; room: Room }) => {
			setRooms((prev) => new Map(prev).set(message.key, message.room));
		});
		socket.on("deleteroom", (key: string) => {
			setRooms((prev) => {
				const updatedMap = new Map(prev);
				updatedMap.delete(key);
				return updatedMap;
			});
		});
		return () => {
			socket.disconnect();
		};
	}, []);

	return (
		<div className="flex-row p-[10vh]">
			<h1>All Rooms</h1>
			<button onClick={createRoom}>Add Room</button>
			<div className="grid gap-2">
				{[...getRooms.entries()].map(([key, room]) => (
					<div key={key} className="w-auto mx-auto bg-gray-400/50 flex justify-around items-center">
						<Link
							href={`/mafia_room?utm_search=${key}`}
							className="inline px-5"
						>
							{room.name}
						</Link>
						<div className="inline px-5">
							{room.onlineCount}/{room.onlineMax}
						</div>
					</div>
				))}
			</div>
			<form className="flex flex-col ">
				<input type="text" value={getDefaultvalue} placeholder="Room name" 
					className="block bg-gray-400/50"/>
				<div className="flex m-auto">
					<input onClick={()=>setBool(!getBool)} type="checkbox" id="CheckPAss" checked={getBool}
						className="block bg-gray-400/50"/>
					<label htmlFor="CheckPAss" 
						className="bg-gray-400/50">{getBool.toString()}</label>
				</div>
				<input type="submit" value="submit" 
					className="bg-gray-400/50"/>
			</form>
		</div>
	);
};

export default Home;
