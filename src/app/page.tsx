"use client";
import Rooms from '@/app/rooms'
import Auth from '@/app/auth'
const Home = () => {
	return (
		<div className='h-full'>
			<div className="flex text-center p-[10vh] justify-around h-full">
				<div className='w-1/3 bg-zinc-800/50 rounded-lg'>
					<Rooms></Rooms>
				</div>
				<div className='w-1/3 bg-zinc-800/50 rounded-lg'>
					<Auth></Auth>
				</div>
			</div>
		</div>
	);
};

export default Home;
