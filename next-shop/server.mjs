import next from "next"
import { createServer } from "node:http"
import { Server } from "socket.io"
import { instrument } from "@socket.io/admin-ui"
import { UserFind, UserVerifyJWT, RoomAddPlayer, RoomFind, RoomSave, RoomDelete, RoomsFindAll, RoomRemovePlayer } from './src/data/models.mjs'
/* Single room */
function createRoomNamespace(io, ID) {
	console.log('--------------')
	console.log('creating a room namespace', ID)
	const decisions = {
		mafia:{ },
		police:{ },
		doctor: { }
	}
	const playersList = {}
	const playersRoles = {}
	let gameState = null
	let playersIn = true
	const RoomNamespace = io.of(`room${ID}`)
	RoomNamespace.on("connection", async (socket) => {
		console.log('CONECTED', socket.id)
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
		if (!Object.keys(playersList).includes(authUsername)){
			io.of(`/${ID}/${authUsername}`).on("connection", createUserDerect)
			//const sucses = await RoomAddPlayer(ID)
			//console.log('adding player count',sucses)
		}
		console.log('    user', authUsername, 'joined room', ID)
		playersList[authUsername] = socket.id
		RoomNamespace.emit('player list update', { users: Object.keys(playersList) })
		socket.on('disconnect',() => {
			console.log('DISCONECTED', socket.id)
			//RoomRemovePlayer(ID)
		})
		socket.on('message', ({from, message, to, JWT}) => {
			console.log('message', {from, message, to, JWT})
			if(playersRoles[from].alive){
				to.forEach((name) => {
					console.log(`/${ID}/${name} emited`)
					io.of(`/${ID}/${name}`).emit('message_recived', { message, from })
				})
			}
		})
		socket.on('start', async ({ roles }) => {
			RoomNamespace.emit('start')
			console.log('game has stared', playersList)
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
			const namearray = Object.keys(playersList)
			roleArray.forEach(role => {
				if (namearray[i] !== undefined) { // Check if the current element is defined
					const ind = namearray[i];
					playersRoles[ind] = {
						role: role,
						alive: true
					};
					io.of(`/${ID}/${ind}`).emit('assignrole', role)
				} else {
					console.warn(`Warning: playersList[${i}] is undefined. Skipping this role.`);
				}
				i++;
			});
			console.log(playersRoles)
			i = 0
			playersIn = false
			const gameLoop = [ 'day', 'mafia', 'police', 'doctor']
			const interval = setInterval(() => {
				console.log(gameLoop[i]);
				RoomNamespace.emit('next', gameLoop[i])
				gameState = gameLoop[i]
				if(gameState=='day') {
					if (Object.keys(decisions.mafia).length !== 0){
						const votedOne = findMostCommonElement(Object.values(decisions.mafia))
						playersRoles[votedOne].alive = false
						console.log(votedOne, 'is dead')
					}
					if (decisions.police !== 0){
						Object.values(decisions.police).forEach((votedOne) => {
							console.log(votedOne, playersRoles[votedOne].role=='mafia'?'is mafia':'is not mafia')
						})
					}
					if (decisions.doctor !== 0){
						Object.values(decisions.doctor).forEach((votedOne) => {
							playersRoles[votedOne].alive = true
							console.log(votedOne, 'was healed')
						})
					}
				}
				//switch (gameLoop[i]) {
				//	case 'day':
				//		console.log('inform who was killed or revived...')
				//		break;
				//	case 'mafia':
				//		console.log('let mafia chose')
				//		break;
				//	case 'police':
				//		console.log('let oficer chose')
				//		break;
				//	case 'doctor':
				//		console.log('let doctor chose')
				//		break;
				//}
				if(i<3) {
					i++
				} else {
					i = 0
				}
			}, 15000)
		})
		socket.on('vote', ({from, against})=>{
			const id = playersList[from]
			const votingrole = playersRoles[from].role
			if(id != socket.id || gameState != votingrole) {
				console.log('ERROR', gameState, votingrole)
				return 
			}
			console.log('wtf', playersList, socket.id)
			console.log(from, 'is', votingrole, 'and voted against', against)
			decisions[gameState][from] = against
			console.log('decisions', decisions)
		})
	})
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

function findMostCommonElement(arr) {
    const countMap = arr.reduce((map, element) => {
        map.set(element, (map.get(element) || 0) + 1);
        return map;
    }, new Map());

    return [...countMap.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}
