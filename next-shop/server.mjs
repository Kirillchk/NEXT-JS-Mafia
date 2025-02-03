import next from "next"
import fs from 'fs'
import { createServer } from "node:http"
import { Server } from "socket.io"
import { v4 } from 'uuid'
import { addKeyValueToJSON, deleteKeyFromJSON, returnDataObjectByKey } from './src/data/manage.mjs'

const filePathrooms = './src/data/rooms.json'
const filePathUsers = './src/data/users.json'

function createRoomNamespace(io, ID) {
	let playersList = []
	io.of(`/${ID}`).on("connection", (socket) => {
		const authData = socket.handshake.auth 
		const userData = returnDataObjectByKey(filePathUsers, authData.username) 
		console.log( authData )
		if( authData.password != userData.password ){
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
		socket.on("createroom", (data) => {
			const ID = v4()
			const room = {
				name: data.name,
				onlineCount: 0,
				onlineMax: data.onlineMax
			}
			addKeyValueToJSON(filePathrooms, ID, room)
			createRoomNamespace(io, ID)
			io.emit("room_created", { key: ID, room: room})
		});
		socket.on("deleteroom", (data) => {
			deleteKeyFromJSON(filePathrooms, data.ID)
			io.emit("deleteroom", data)
		});
  });
	
	const jsonString = fs.readFileSync(filePathrooms, 'utf8');
	const data = JSON.parse(jsonString);
	Object.keys(data).forEach((roomID) => createRoomNamespace(io, roomID))
  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    });
});
