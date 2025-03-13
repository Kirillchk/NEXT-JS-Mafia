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
				{children}
			</body>			
    </html>
  );
}
