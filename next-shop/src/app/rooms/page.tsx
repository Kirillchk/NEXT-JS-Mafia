"use client";
import Link from "next/link";
import { useState, useEffect } from 'react'
import io, { Socket } from "socket.io-client";
interface Room {
  name: string;
  password: boolean;
  onlineCount: number;
  onlineMax: number;
}
let socket: Socket;
/*
const rooms = {
	key1:
	{
		name: "vasia",
		password: false,
		onlineCount: 1,
		onlineMax: 2
	},
	key2:
	{
		name: "sania",
		password: true,
		onlineCount: 1,
		onlineMax: 6
	},
	key3:
	{
		name: "name",
		password: false,
		onlineCount: 8,
		onlineMax: 8
	}
}
const roomArray = Object.values(rooms);
*/
const Home = () => {
	const [getRooms, setRooms] = useState<Room[]>([])
	useEffect(() => {
		async function Start(){
			const res = await fetch('http://localhost:3000/api/allrooms')
			const data = await res.json()
			setRooms(Object.values(data))
		}
		Start()
    socket = io("http://localhost:3000");
    socket.on("connect", () => {
      console.log("Connected to WebSocket server!");
    });
    socket.on("createroom", (message) => {
			setRooms((prev) => [...prev, message])
    });
    return () => {
      socket.disconnect();
    };
	}, [])
  return (
    <>
			<div className="flex-row p-[10vh]">
				<h1>All rooms</h1>
				<div className="">
					{getRooms.map((room, index) => (
						<div key={index} className="w-12 mx-auto flex justify-around">
						 <Link href={`/mafia_room?utm_search=${room.name}`} className="inline px-5">{room.name}</Link>
						 <div className="inline px-5">{room.onlineCount}/{room.onlineMax}</div>
						</div>
					))}
				</div>
			</div>
    </>
  );
};

export default Home;
