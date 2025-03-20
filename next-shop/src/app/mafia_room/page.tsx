'use client'
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import io, { Socket } from "socket.io-client";
import { forwardRef, useImperativeHandle } from 'react';
let socket: Socket | null = null;
let socketMessages: Socket | null = null;

interface message {
	from: string,
	message: string
}
type Roles = {
	mafia: number;
	police: number;
	doctor: number;
	citizen: number;
};

export default function Home() {
	const timerRef = useRef<TimerHandle>(null); // Ref for the Timer component
	const searchParams = useSearchParams();
	const [messageTo, setMessageTo] = useState<string[]>([])
	const [getChat, setChat] = useState<Array<message>>([]);
	const [getMessage, setMessage] = useState<string>('');
	const [getPeople, setPeople] = useState<string[]>([]);
	const [roles, setRoles] = useState<Roles>({
		mafia: 2,
		police: 1,
		doctor: 1,
		citizen: 2,
	});
	/************************** fix this shit later */
	const [getmyrole, setmyrole] = useState<string>('')

	const handleIncrement = (role: keyof Roles) => {
	if (totalPlayers < 6) {
		setRoles((prevRoles) => ({
		...prevRoles,
		[role]: prevRoles[role] + 1,
		}));
	}
	};

	const handleDecrement = (role: keyof Roles) => {
	if (roles[role] > 0) {
		setRoles((prevRoles) => ({
		...prevRoles,
		[role]: prevRoles[role] - 1,
		}));
	}
	};

	const totalPlayers = Object.values(roles).reduce((sum, count) => sum + count, 0);

	async function conectToRoom() {
		const utmSource = searchParams.get('utm_room');
		let password = localStorage.getItem('userPassword');
		let username = localStorage.getItem('userNickname');
		setMessageTo([username||''])
		console.log(
			'trying to connect to',
			`http://localhost:3000/room${utmSource} auth:${username} ${password}`
		);
		socket = io(`http://localhost:3000/room${utmSource}`, {
			auth: {
				username: username,
				password: password,
			},
		});

		socket.on('connect', () => {
			console.log('Connected to WebSocket server!');
			if (!socketMessages) {
				conectToChat();
			}
		});

		socket.on('player list update', (data) => {
			console.log('player list was updated',data)
			const newlist = data.users
			setPeople(newlist.filter((item:string) => item !== username));
			
		});
		socket.on('next', (data)=>{
			console.log('next step is',data)
			if (timerRef.current) {
				timerRef.current.reset(); // Call the reset function in the Timer component
			}
		})
		socket.on('start', ()=>{
			console.log('game has started')
			if (timerRef.current) {
				timerRef.current.reset();
			}
		})
	}

	async function conectToChat() {
		socketMessages = io(`http://localhost:3000/${searchParams.get('utm_room')}/${localStorage.getItem('userNickname')}`);
		socketMessages.on('connect', () => {
			console.log('established message socket');
		});
		socketMessages.on('message_recived', (data) => {
			console.log(data);
			setChat((prev) => [...prev, data]);
		});
		socketMessages.on('assignrole', (data) => {
			setmyrole(data)
		})
	}

	const triggerReset = () => {
	
	};

	useEffect(() => {
	if (!socket) {
		conectToRoom();
	}
	return () => {
		if (socket) {
			socket.disconnect();
			socket = null;
			console.log('disconnected');
		}
	};
	}, [searchParams]);

	const triggerEmit = () => {
		if (socket?.connected) {
			socket.emit('message', {
				from: localStorage.getItem('userNickname'),
				message: getMessage,
				to: messageTo,
				JWT: localStorage.getItem('JWT'),
			});
		}
		console.log('socket connection is', socket?.connected);
	};

	const triggerDebug = () => {
		console.log('debug');
		socket?.emit('start', roles);
	};

	return (
		<div className="flex justify-between">
			<aside className="h-[100vh] w-[20vw]">
			<div className="overflow-y-scroll h-[90%]">
				{getChat.map((message, index) => (
				<div className="overflow-clip" key={index}>
					{message.from}: {message.message}
				</div>
				))}
			</div>
			<div className="flex justify-between">
				<input
				type="text"
				onChange={(e) => {
					setMessage(e.target.value);
				}}
				className="bg-gray-400/50"
				/>
				<button onClick={triggerEmit}>Send</button>
			</div>
			</aside>
			<div className="m-auto">
			<Timer ref={timerRef} />
			<h1>your role is {getmyrole}</h1>
			<p>Total Players: {totalPlayers} / 6</p>
			{Object.entries(roles).map(([role, count]) => (
				<div key={role}>
				<span>
					{role}: {count}
				</span>
				<button onClick={() => handleDecrement(role as keyof Roles)} disabled={count === 0}>
					-
				</button>
				<button onClick={() => handleIncrement(role as keyof Roles)} disabled={totalPlayers >= 6}>
					+
				</button>
				</div>
			))}
			<button onClick={triggerDebug}>Start</button>
			<button onClick={triggerReset}>Reset</button>
			</div>

			<aside className="h-[100vh] w-[20vw]">
			{getPeople.map((player, index) => (
				<div className="overflow-clip" key={index}>
					{player}
					<input type="checkbox" name="" id="" onChange={(event)=>{
						const toggle = event.target.checked
						if (toggle) {
							setMessageTo((prev) => [
								...prev, player
							])
						} else {
							setMessageTo((prev) => 
								prev.filter((item) => item !== player)
							)
						}
					}} />
				</div>
			))}
			{getPeople.map((player, index) => (
				<button className="overflow-clip" key={index} onClick={() => {
					if(getmyrole =='citizen') {
						console.log('you are a citizen')
					} else {
						socket?.emit('vote', {from: localStorage.getItem('userNickname'), against: player})
					}
				}}>
					{player}
				</button>
			))}
			</aside>
		</div>
	);
}


// Define the type for the ref (optional but recommended for TypeScript)
export type TimerHandle = {
  reset: () => void;
};

const Timer = forwardRef<TimerHandle>((props, ref) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const reset = () => {
    setTimeLeft(30); // Reset the timer to 30 seconds
  };

  // Expose the reset function to the parent via ref
  useImperativeHandle(ref, () => ({
    reset,
  }));

  useEffect(() => {
    if (timeLeft === 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId); // Cleanup on unmount
  }, [timeLeft]);

  return (
    <div>
      <h1>Time Left: {timeLeft} seconds</h1>
    </div>
  );
});
