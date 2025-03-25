"use client";
import Link from "next/link";
const Home = () => {
	return (
		<div>
			<div className="flex-row text-center p-[10vh]">
				<h1>
					<Link href='/rooms'>Rooms list</Link>
				</h1>
				<h1>
					<Link href='/authenticate'>authenticate</Link>
				</h1>
			</div>
		</div>
	);
};

export default Home;
