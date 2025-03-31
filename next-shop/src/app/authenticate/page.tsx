"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Authenticate() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get("userNickname") as string;
    const password = formData.get("userPassword") as string;

    try {
      const endpoint = isLogin ? "login" : "createuser";
      const res = await fetch(`http://localhost:3000/api/users/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      localStorage.setItem("JWT", data.JWT);
      localStorage.setItem("userNickname", username);
      localStorage.setItem("userPassword", password);
      router.push("/rooms");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-lg p-8">
      <h1 className="text-2xl font-bold mb-6">
        {isLogin ? "Login" : "Register"}
      </h1>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userNickname" className="block mb-1">Username</label>
          <input
            id="userNickname"
            name="userNickname"
            type="text"
            minLength={6}
            required
            className="w-full px-4 py-2 bg-gray-700 rounded"
            placeholder="Enter username"
          />
        </div>
        
        <div>
          <label htmlFor="userPassword" className="block mb-1">Password</label>
          <input
            id="userPassword"
            name="userPassword"
            type="password"
            minLength={4}
            required
            className="w-full px-4 py-2 bg-gray-700 rounded"
            placeholder="Enter password"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
        >
          {isLoading ? "Processing..." : isLogin ? "Login" : "Register"}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-400 hover:underline"
        >
          {isLogin ? "Need an account? Register" : "Have an account? Login"}
        </button>
      </div>
    </div>
  );
}