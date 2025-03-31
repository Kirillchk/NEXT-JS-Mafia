// page.tsx
"use client";
import Link from "next/link";

const Home = () => {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-8">Welcome to Mafia Game</h1>
      
      <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-lg p-8">
        <h2 className="text-2xl mb-6">How to Play</h2>
        <p className="mb-8">
          Mafia is a social deduction game where players are secretly assigned roles as either Mafia or innocent townsfolk.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link 
            href="/rooms" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            Join a Game
          </Link>
          <Link 
            href="/authenticate" 
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition"
          >
            Login/Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;