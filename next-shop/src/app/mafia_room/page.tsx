'use client'
const getroles = {
	doctors: 2,
	fuflo: 1,
	mamsa: 0,
	maasmsa: 0,
	mafia: 10,
	mama: 0,
}
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import io, { Socket } from "socket.io-client";
let socket: Socket | null = null;

interface message {
	from: string,
	message: string
}
export default function
Home () {
	const searchParams = useSearchParams();
	useEffect(() => {	
		const utmSource = searchParams.get('utm_room');
		if (!socket){
			socket = io(`http://localhost:3000/${utmSource}`, {auth: { 
				username: userName,
				password: password
			}});
			socket.on("connect", () => {
				console.log("Connected to WebSocket server!");
			});
			socket.on('message_recived', (data) => {
				console.log(data);
				setChat((perv) => [...perv, data])
			})
			socket.on('player list update', (data) => {
				setPeople(data.users)
			})
		}
		return () => {
			if (socket) {
				socket.disconnect();
				socket = null;
			}
		};
	}, [])
	const [getChat, setChat] = useState<Array<message>>([])	
	const [getMessage, setMessage] = useState<string>('')
	const [getPeople, setPeople] = useState<string[]>([])

	const userName = localStorage.getItem("userNickname")
	const password = localStorage.getItem('userPassword')
	const JWT = localStorage.getItem('JWT')

	const triggerEmit = () => {
		if (socket) {
			socket.emit("message", { from: userName, message: getMessage, to: "sperma", JWT: JWT })
		}
	}
  return (
	<div className="flex justify-between">
		<aside className="h-[100vh] w-[20vw]">
			<div className="overflow-y-scroll h-[90%]">
				{getChat.map((message, index)=> (
					<div className="overflow-clip" key={index}>
						{message.from}: {message.message}
					</div>
				))}
			</div>
			<div className='flex justify-between'>
				<input type="text" onChange={(e) => {setMessage(e.target.value)}} className="bg-gray-400/50"/>
				<button onClick={triggerEmit}>Send</button>
			</div>
		</aside>
		<span className="m-auto">
			{Object.keys(getroles).map((role, index) => (
				getroles[role as keyof typeof getroles] !== 0 &&
				<div role={role} key={index}>
					{role}: {getroles[role as keyof typeof getroles]}
				</div> 
			))}
		</span>
		<aside className="h-[100vh] w-[20vw]">
			{getPeople.map((player, index) => (
				<div className="overflow-clip" key={index}>
					{player}
				</div>
			))}
		</aside>
	</div>
	)
};
