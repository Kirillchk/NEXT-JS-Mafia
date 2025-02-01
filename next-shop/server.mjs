import next from "next"
import fs from 'fs'
import { createServer } from "node:http"
import { Server } from "socket.io"
import { v4 } from 'uuid'
import { addKeyValueToJSON, deleteKeyFromJSON, returnDataObjectByKey } from './src/data/manage.mjs'

const filePath = './src/data/rooms.json'

function createRoomNamespace(io, ID) {
	io.of(`/${ID}`).on("connection", (socket) => {
		console.log("conected to the popipipo", )
		const authData = socket.handshake.auth 
		const userData = returnDataObjectByKey(filePath, authData.username) 
		if( authData.password != userData.password ){
			return
		}
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
			addKeyValueToJSON(filePath, ID, room)
			createRoomNamespace(io, ID)
			io.emit("room_created", { key: ID, room: room})
		});
		socket.on("deleteroom", (data) => {
			deleteKeyFromJSON(filePath, data.ID)
			io.emit("deleteroom", data)
		});
  });
	
	const jsonString = fs.readFileSync(filePath, 'utf8');
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
