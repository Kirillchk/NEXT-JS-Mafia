"use client"
import { useEffect, useState } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("userNickname"));
  }, []);

  return (
	<html lang="en">
		<body className="relative min-h-screen">
			<div className="main_background"></div>
			<Navbar isAuthenticated={isAuthenticated} />
			<main className="container mx-auto px-4 py-8">
			{children}
			</main>
		</body>
	</html>
  );
}