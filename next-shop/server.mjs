import next from "next"
import { createServer } from "node:http"
import { Server } from "socket.io"
import { UserFind, UserVerifyJWT, RoomAddPlayer, RoomFind, RoomSave, RoomDelete, RoomsFindAll } from './src/data/models.mjs'

function createRoomNamespace(io, ID) {
	let playersList = []
	io.of(`/${ID}`).on("connection", (socket) => {
		const authData = socket.handshake.auth 
		const userData = UserFind(authData.username) 
		const roomData = RoomFind(ID)
		RoomAddPlayer(ID)
		if( authData.password != userData.password || roomData.onlineCount >= roomData.onlineMax){
			return
		}
		if (!playersList.includes(authData.username)){
			playersList.push(authData.username)
		} 
		io.of(`/${ID}`).emit('player list update', { users: playersList })
		socket.on("message", (data) => {
			if (data.JWT != userData.JWT){ 
				return 
			}
			console.log(`room: ${ID}\n mesagge recived: `, data)
			io.of(`/${ID}`).emit('message_recived', { from: authData.username, message: data.message, to: data.to })
		})
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
		socket.on("createroom", async (data) => {
			const room = {
				roomname: data.roomname,
				online: 0,
			}
			const result = await RoomSave(room)
			const verified = await UserVerifyJWT(data.userName, data.JWT) 
			console.log('result', !result, 'verified', !verified)
			if (!verified || !result) {
				console.log('returning')
				return
			}
			console.log('not returning')
			createRoomNamespace(io, room.roomname)
			console.log('creating a room')
			io.emit("room_created", { key: room.roomname, room: room})
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
