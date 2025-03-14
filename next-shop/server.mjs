import next from "next"
import { createServer } from "node:http"
import { Server } from "socket.io"
import { v4 } from 'uuid'
import { UserFind, UserVerifyJWT, RoomAddPlayer, RoomFind, RoomSave, RoomDelete, RoomsFindAll } from './src/data/models.mjs'

function createRoomNamespace(io, ID) {
	console.log('creating a room namespace', ID)
	let playersList = []
	io.of(`/${ID}`).on("connection", async (socket) => {
		const { password: authPassword, username: authUsername } = socket.handshake.auth 
		//console.log('conecting to:', ID, 'auth:', authPassword, ' ', authUsername)
		const { password: databasePassword } = await UserFind(authUsername) 
		//console.log('returned user password ', databasePassword)
		const { online } = await RoomFind(ID)
		//console.log('returned online', online)
		RoomAddPlayer(ID)
		if(authPassword != databasePassword || online >= 15){
			//console.log('returned because', 
			//	authPassword,
			//	databasePassword,
			//	online)
			return
		}
		if (!playersList.includes(authUsername)){
			console.log('user ', authUsername, 'joined room ', ID)
			playersList.push(authUsername)
			socket.emit('player list update', { users: playersList })
			io.of(`/${ID}/${authUsername}`).on("connection", createUserDerect)
		}
		socket.on('start', async () => {
			console.log('game has stared')
		})
	})
	//io.of(`/${ID}/user`).on("message", async (data) => {
	//	console.log(`room: ${ID}\n mesagge recived: `, data)
	//	io.of(`/${ID}`).emit('message_recived', { from: authUsername, message: data.message, to: data.to })
	//})
}
async function createUserDerect(socket) {
	console.log('user consected to socket');
	socket.on('message', async (data) => {
		socket.emit('message_recived', { from: authUsername, message: data.message })
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
