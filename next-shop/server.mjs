import next from "next"
import { createServer } from "node:http"
import { Server } from "socket.io"
import { UserFind, UserVerifyJWT, RoomAddPlayer, RoomFind, RoomSave, RoomDelete, RoomsFindAll, RoomRemovePlayer } from './src/data/models.mjs'
/* Single room */
function createRoomNamespace(io, ID) {
	console.log('--------------')
	console.log('creating a room namespace', ID)
	let playersList = []
	io.of(`room${ID}`).on("connection", async (socket) => {
		const { password: authPassword, username: authUsername } = socket.handshake.auth 
		console.log('  1 conecting to:', ID, 'auth:', authPassword, ' ', authUsername)
		const { password: databasePassword } = await UserFind(authUsername) 
		console.log('  2 returned user password ', databasePassword)
		//const { online } = await RoomFind(ID)
		//console.log('  3 returned online', online)
		if(authPassword != databasePassword  /*|| online >= 15*/){
			console.log('  ! returned because', 
				authPassword,
				databasePassword,
				/*online*/)
			return
		}
		if (!playersList.includes(authUsername)){
			console.log('    user', authUsername, 'joined room', ID)
			playersList.push(authUsername)
			socket.emit('player list update', { users: playersList })
			io.of(`/${ID}/${authUsername}`).on("connection", createUserDerect)
			const sucses = await RoomAddPlayer(ID)
			console.log('adding player count',sucses)
		}
		socket.on('disconnect',() => {
			console.log('DISCONECTED', socket.id)
			//RoomRemovePlayer(ID)
		})
		socket.on('message', ({from, message, to, JWT}) => {
			console.log('message', message)
			to.forEach((name) => {
				console.log(`/${ID}/${name} emited`)
				io.of(`/${ID}/${name}`).emit('message_recived', { message, from })
			})
		})
		//socket.on('start', async (data) => {
		//	console.log('game has stared')
		//})
	})
	//io.of(`/${ID}/user`).on("message", async (data) => {
	//	console.log(`room: ${ID}\n mesagge recived: `, data)
	//	io.of(`/${ID}`).emit('message_recived', { from: authUsername, message: data.message, to: data.to })
	//})
}
/* Direct messages for lobbies */
async function createUserDerect(socket) {
	console.log('   user conected to chat');
	socket.on('message', async (data) => {
		console.log('mesage triggered', data);
		//socket.emit('message_recived', { from: authUsername, message: data.message })
	})
}

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = 3000
const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
	const httpServer = createServer(handler)
	const io = new Server(httpServer)
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
