"use client";
import Link from "next/link";
const Home = () => {
	return (
		<div>
			<div className="flex-row text-center p-[10vh]">
				<h1>Mafia</h1>
				<div>
					<Link href='/rooms'>Rooms list</Link>
				</div>
			</div>
		</div>
	);
};

export default Home;
