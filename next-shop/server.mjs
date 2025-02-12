import next from "next"
import fs from 'fs'
import { createServer } from "node:http"
import { Server } from "socket.io"
import { v4 } from 'uuid'
import { addKeyValueToJSON, deleteKeyFromJSON, returnDataObjectByKey, VerifyJWT, UpdateInfo } from './src/data/manage.mjs'
import mongoose from "mongoose"

const filePathrooms = './src/data/rooms.json'
const filePathUsers = './src/data/users.json'
mongoose.connect("mongodb://localhost:27017/mafia");
const userSchema = new mongoose.Schema({
	_id: String,
	password: String,
	JWT: String
});

const UsersModel = mongoose.model('user', userSchema)

const user = new UsersModel({
	_id: 'fsfsdf',
	password: 'neswsew',
	JWT: 'adfhashf'
})
user.save()

function createRoomNamespace(io, ID) {
	let playersList = []
	io.of(`/${ID}`).on("connection", (socket) => {
		const authData = socket.handshake.auth 
		const userData = returnDataObjectByKey(filePathUsers, authData.username) 
		const roomData = returnDataObjectByKey(filePathrooms, ID)
		UpdateInfo(filePathrooms, ID, { onlineCount: roomData.onlineCount+1 })
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
		socket.on("createroom", (data) => {
			if (!VerifyJWT(filePathUsers, data.userName, data.JWT)) {
				return
			}
			const ID = v4()
			const room = {
				name: data.name,
				onlineCount: 0,
				onlineMax: Number(data.onlineMax)||5
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
