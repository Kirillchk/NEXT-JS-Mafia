"use client";
import Rooms from '@/app/rooms'
import Auth from '@/app/auth'
const Home = () => {
	return (
		<div className='h-full'>
			<div className="flex flex-col text-center p-[10vh] justify-around h-full">
				<div className=' bg-zinc-800/50 rounded-lg'>
					<Auth></Auth>
				</div>
				<div className=' bg-zinc-800/50 rounded-lg'>
					<Rooms></Rooms>
				</div>
			</div>
		</div>
	);
};

export default Home;
