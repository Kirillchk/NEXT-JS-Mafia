// components/Navbar.tsx
"use client"
import Link from "next/link";

export default function Navbar({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <nav className="bg-black/50 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">Mafia Game</Link>
        
        <div className="flex gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/rooms" className="hover:underline">Rooms</Link>
              <button onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}>Logout</button>
            </>
          ) : (
            <Link href="/authenticate" className="hover:underline">Login/Register</Link>
          )}
        </div>
      </div>
    </nav>
  );
}