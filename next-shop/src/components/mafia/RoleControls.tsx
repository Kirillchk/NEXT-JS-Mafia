// components/mafia/RoleControls.tsx
import type { Roles } from './GameLayout'; // Import the Roles type

interface RoleControlsProps {
	roles: Roles;
	totalPlayers: number;
	onIncrement: (role: keyof Roles) => void;
	onDecrement: (role: keyof Roles) => void;
	onStart: () => void;
  }
  
  export default function RoleControls({ 
	roles, 
	totalPlayers, 
	onIncrement, 
	onDecrement, 
	onStart 
  }: RoleControlsProps) {
	return (
	  <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
		<h2 className="text-xl font-semibold mb-4">Setup Game</h2>
		
		<div className="space-y-4">
		  {Object.entries(roles).map(([role, count]) => (
			<div key={role} className="flex items-center justify-between">
			  <span className="capitalize">{role}:</span>
			  <div className="flex items-center gap-2">
				<button
				  onClick={() => onDecrement(role as keyof Roles)}
				  disabled={count === 0}
				  className="w-8 h-8 bg-red-600 rounded disabled:opacity-50"
				>
				  -
				</button>
				<span className="w-8 text-center">{count}</span>
				<button
				  onClick={() => onIncrement(role as keyof Roles)}
				  disabled={totalPlayers >= 6}
				  className="w-8 h-8 bg-green-600 rounded disabled:opacity-50"
				>
				  +
				</button>
			  </div>
			</div>
		  ))}
		</div>
  
		<div className="mt-6 text-center">
		  <p className="mb-2">Total Players: {totalPlayers} / 6</p>
		  <button
			onClick={onStart}
			disabled={totalPlayers !== 6}
			className={`px-4 py-2 rounded ${
			  totalPlayers === 6 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600'
			}`}
		  >
			Start Game
		  </button>
		</div>
	  </div>
	);
  }