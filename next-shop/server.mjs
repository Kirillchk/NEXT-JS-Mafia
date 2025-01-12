import { createServer } from "node:http"
import next from "next"
import { Server } from "socket.io"
import { v4 } from 'uuid'
import fs from 'fs';

const filePath = './data/rooms.json'

function addKeyValueToJSON(filePath, key, value) {
    try {
        const jsonString = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(jsonString);
        data[key] = value;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Key "${key}" added successfully.`);
    } catch (err) {
        console.error('Error updating JSON file:', err);
    }
}
function deleteKeyFromJSON(filePath, key) {
	try {
			const jsonString = fs.readFileSync(filePath, 'utf8');
			const data = JSON.parse(jsonString);

			if (key in data) {
					delete data[key];
					fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
					console.log(`Key "${key}" deleted successfully.`);
			} else {
					console.log(`Key "${key}" not found in the JSON file.`);
			}
	} catch (err) {
			console.error('Error updating JSON file:', err);
	}
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
		console.log('AAAAAAAAAAAA')
		socket.on("message", ({ roomId, message }) => {
			console.log("Received message:", message, "to room ", roomId)
			io.to(roomId).emit('message', `${socket.id}: ${message}`)
		})
		socket.on("createroom", (data) => {
			const ID = v4()
			socket.join(ID); 
			const room = {
				name: data.name,
				password: data.password,
				onlineCount: 0,
				onlineMax: data.onlineMax
			}
			addKeyValueToJSON(filePath, ID, room)
			io.emit("createroom", room)
		});
		socket.on("deleteroom", (data) => {
			deleteKeyFromJSON(filePath, data.ID)
			io.emit("deleteroom", data)
		});
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    });
});
