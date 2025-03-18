import next from "next"
import { createServer } from "node:http"
import { Server } from "socket.io"
import { instrument } from "@socket.io/admin-ui"
import { UserFind, UserVerifyJWT, RoomAddPlayer, RoomFind, RoomSave, RoomDelete, RoomsFindAll, RoomRemovePlayer } from './src/data/models.mjs'
/* Single room */
function createRoomNamespace(io, ID) {
	console.log('--------------')
	console.log('creating a room namespace', ID)
	let playersList = []
	let playersRoles = {}
	let playersIn = true
	const RoomNamespace = io.of(`room${ID}`)
	RoomNamespace.on("connection", async (socket) => {
		const { password: authPassword, username: authUsername } = socket.handshake.auth 
		console.log('  1 conecting to:', ID, 'auth:', authPassword, ' ', authUsername)
		const { password: databasePassword } = await UserFind(authUsername) 
		console.log('  2 returned user password ', databasePassword)
		//const { online } = await RoomFind(ID)
		//console.log('  3 returned online', online)
		if(authPassword != databasePassword || !playersIn /*|| online >= 15*/){
			console.log('  ! returned because', 
				authPassword,
				databasePassword,
				/*online*/)
			return
		}
		if (!playersList.includes(authUsername)){
			console.log('    user', authUsername, 'joined room', ID)
			playersList.push(authUsername)
			io.of(`/${ID}/${authUsername}`).on("connection", createUserDerect)
			//const sucses = await RoomAddPlayer(ID)
			//console.log('adding player count',sucses)
		}
		RoomNamespace.emit('player list update', { users: playersList })
		socket.on('disconnect',() => {
			console.log('DISCONECTED', socket.id)
			//RoomRemovePlayer(ID)
		})
		socket.on('message', ({from, message, to, JWT}) => {
			console.log('message', {from, message, to, JWT})
			to.forEach((name) => {
				console.log(`/${ID}/${name} emited`)
				io.of(`/${ID}/${name}`).emit('message_recived', { message, from })
			})
		})
		socket.on('start', async ({ roles }) => {
			RoomNamespace.emit('start')
			console.log('game has stared')
			roles = {
				mafia: 2,
				police: 1,
				doctor: 1,
				citizen: 2,
			}
			const rolesEntries = Object.entries(roles)
			const roleArray = [];

			// Populate the array with roles based on their counts
			for (const [role, count] of rolesEntries) {
				for (let i = 0; i < count; i++) {
					roleArray.push(role);
				}
			}
			shuffleArray(roleArray);
			let i = 0;
			roleArray.forEach(role => {
				if (playersList[i] !== undefined) { // Check if the current element is defined
					const ind = playersList[i].toString(); // Convert to string
					playersRoles[ind] = role; // Assign the role
				} else {
					console.warn(`Warning: playersList[${i}] is undefined. Skipping this role.`);
				}
				i++;
			});
			console.log(playersRoles)
			i = 0
			playersIn = false
			const gameLoop = [ 'day', 'mafia', 'police']
			const interval = setInterval(() => {
				console.log(gameLoop[i]);
				RoomNamespace.emit('next', gameLoop[i])
				if(i<2){
					i++
				} else {
					i = 0
				}
			}, 30000)
		})
	})
	//io.of(`/${ID}/user`).on("message", async (data) => {
	//	console.log(`room: ${ID}\n mesagge recived: `, data)
	//	io.of(`/${ID}`).emit('message_recived', { from: authUsername, message: data.message, to: data.to })
	//})
}
/* Direct messages for lobbies */
async function createUserDerect(socket) {
	console.log('   user conected to chat');
}

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = 3000
const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
	const httpServer = createServer(handler)
	const io = new Server(httpServer, {
		cors: {
			origin: ["https://admin.socket.io"], // Allow Admin UI to connect
			credentials: true,
		},
	})

	instrument(io, {
		auth: {
		  type: "basic",
		  username: "admin", 
		  password: "$2a$12$1Bwx5tqD7h4AbY6JRM8.ZOWwNgjo4quDXJt5adDhC.R7NZsoddyW6",
		},
		mode: "development",
	  });
/* Lobbies management */
	io.on("connection", (socket) => {
		socket.on("createroom", async ({ userName, JWT, roomname }) => {
			const verified = await UserVerifyJWT(userName, JWT) 
			if (!verified) {
				console.log('returning, failed to verify JWT')
				return
			}
			const room = {
				roomname: roomname,
				online: 0,
				AdminJWT: JWT
			}
			const result = await RoomSave(room)
			if (!result) {
				console.log('returning, failed to save')
				return
			}
			console.log('not returning')
			createRoomNamespace(io, roomname)
			console.log('creating a room')
			io.emit("room_created", { key: roomname, room: room})
		});
		socket.on("deleteroom", (data) => {
			RoomDelete(data.ID)
			console.log('deleting a room')
			io.emit("deleteroom", data)
		});
	});
	RoomsFindAll().then(
		(data) => data.forEach(
			(room) => createRoomNamespace(io, room.roomname)
		)
	)
	httpServer
		.once("error", (err) => {
			console.error(err);
			process.exit(1);
		})
		.listen(port, () => {
			console.log(`> Ready on http://${hostname}:${port}`)
		});
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function logRolesInRandomOrder(roles) {
}
