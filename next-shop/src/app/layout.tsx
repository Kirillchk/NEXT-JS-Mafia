"use client"
import { useEffect, useState } from "react";
import "./globals.css";
export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  const [getShowSite, setShowSite] = useState<boolean>(false)
	useEffect(()=>{
		setShowSite(!!localStorage.getItem("userNickname"))
		console.log(localStorage.getItem("userNickname"))
	}, [])
	return (
    <html lang="en">
			<body>
			<div className="main_background"></div>
				{
					//getShowSite ?
					<>
						{children}
					</>
					//:
					//<>
					//	<form action={(form) => {
					//		const name = form.get('userNickname') as string || ''
					//		localStorage.setItem('userNickname', name)
					//		console.log(name)
					//	}}>
					//		<input required type="text" name="userNickname"/>
					//		<input type="submit" />
					//	</form>
					//</>
				}
			</body>			
    </html>
  );
}
