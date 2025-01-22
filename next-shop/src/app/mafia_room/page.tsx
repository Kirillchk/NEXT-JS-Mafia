'use client'
const getchat = [
	{
		message: "asdasdassssss sssssss ssssssssssssssss ssssssssssssss sssss",
		from: "sease"
	},
	{
		message: "asdasda",
		from: "sease"
	},
	{
		message: "asdasda",
		from: "sease"
	},
	{
		message: "asdasda",
		from: "sease"
	},
	{
		message: "asdasda",
		from: "sease"
	},
	{
		message: "asdasda",
		from: "sease"
	},
	{
		message: "asdasda",
		from: "sease"
	},
	{
		message: "asdasda",
		from: "sease"
	},
	{
		message: "asdasda2",
		from: "sease"
	},
	{
		message: "asdasda3",
		from: "sease"
	},
	{
		message: "asdasda4",
		from: "sease"
	},
	{
		message: "asdasda5",
		from: "sease"
	},
]
const getpeople = [
	{
		nickname: "ses",
		color: "red"
	},
	{
		nickname: "ses2",
		color: "red"
	},
	{
		nickname: "ses3",
		color: "red"
	},
	{
		nickname: "ses4",
		color: "red"
	},
	{
		nickname: "ses5",
		color: "red"
	},
]
const getroles = {
	doctors: 2,
	fuflo: 1,
	mamsa: 0,
	maasmsa: 0,
	mafia: 10,
	mama: 0,
}
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import io, { Socket } from "socket.io-client";
let socket: Socket

export default function 
Home () {
	useEffect(() => {

	})
  const searchParams = useSearchParams();
  const utmSource = searchParams.get('utm_room');
  return (
	<div className="flex justify-between">
		<aside className="h-[100vh] w-[20vw]">
			<div className="overflow-y-scroll h-[90%]">
				{getchat.map((message, index)=> (
					<div className="overflow-clip" key={index}>
						{message.from}: {message.message}
					</div>
				))}
			</div>
			<div>
				{utmSource}
				<button>Send</button>
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
			{getpeople.map((player, index) => (
				<div className="overflow-clip" key={index}>
					{player.nickname}: {player.color}
				</div>
			))}
		</aside>
  </div>
	)
};
