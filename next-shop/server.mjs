import next from "next"
import { createServer } from "node:http"
import { Server } from "socket.io"
import { instrument } from "@socket.io/admin-ui"
import { UserFind, UserVerifyJWT, RoomAddPlayer, RoomFind, RoomSave, RoomDelete, RoomsFindAll, RoomRemovePlayer } from './src/data/models.mjs'
/* Single room */
function createRoomNamespace(io, ID) {
	const playersList = {}
	const playersRoles = {}
	let playersIn = true
	let gameState = null
	let gameTimer = null
	
	const Roles = {} 
	class Role {
		constructor (name, NarrateArg){
			Roles[name] = this
			this.name = name
			this.NarrateArg = NarrateArg
			this.decisions = {}
		}
		Narate(){
			const decisions = Roles[this.name].decisions
			if (Object.keys(decisions).length != 0){
				this.NarrateArg(decisions)
			}
		}
	}
	new Role('mafia',() => {
		const mafiaDecisions = Roles['mafia'].decisions
		if (Object.keys(mafiaDecisions).length !== 0){
			const votedOne = findMostCommonElement(Object.values(mafiaDecisions))
			playersRoles[votedOne].alive = false
			console.log(votedOne, 'is dead')
			Object.keys(playersList).forEach((name) => {
				io.of(`/${ID}/${name}`).emit('message_recived', { message:`${votedOne} was visited by mafia`, from: 'Host' })
			})
		}
	})
	new Role('poice',() => {
		if (decisions.police !== 0){
			Object.values(decisions.police).forEach((votedOne) => {
				console.log(votedOne, playersRoles[votedOne].role=='mafia'?'is mafia':'is not mafia')
				const result = playersRoles[votedOne].role == 'mafia' ? 
				'Sheriff has discovered a mafia':'Sheriff has failed to discover a mafia'
				Object.keys(playersList).forEach((name) => {
					io.of(`/${ID}/${name}`).emit('message_recived', { message: result, from: 'Host' })
				})
			})
		}
	})
	new Role('doctor',() => {
		if (decisions.doctor !== 0){
			Object.values(decisions.doctor).forEach((votedOne) => {
				playersRoles[votedOne].alive = true
				console.log(votedOne, 'was healed')
				Object.keys(playersList).forEach((name) => {
					io.of(`/${ID}/${name}`).emit('message_recived', { message: `${votedOne} was visited by doctor`, from: 'Host' })
				})
			})
		} 
	})

	const gameLoop = [ 'day', 'mafia', 'police', 'doctor']
	function Round(iteration){
		gameState = gameLoop[iteration]
		RoomNamespace.emit('next', gameLoop[iteration])
		console.log('now its', gameState)
		if (iteration < 3 && iteration != 0) {
			StartTimer(iteration+1)
		} else {
			NarrateMafia()
			NarratePolice()
			NarrateDoctor()
			decisions = {
				mafia:{ },
				police:{ },
				doctor: { }
			}
			const res = CheckForVictory()
			if(!res){
				StartTimer(iteration==3?0:iteration+1)
			}
		}
	}
	function StartTimer(iteration = 0){
		gameTimer = setTimeout(Round, 15000, iteration)
	}
	function SkipTimer(){
		const iteration = gameTimer._timerArgs[0] + 1
		clearTimeout(gameTimer)
		StartTimer(iteration)
		RoomNamespace.emit('next', gameLoop[iteration])
	}
	const decisions = {
		mafia:{ },
		police:{ },
		doctor: { }
	}
	function NarrateMafia(){
		if (Object.keys(decisions.mafia).length !== 0){
			const votedOne = findMostCommonElement(Object.values(decisions.mafia))
			playersRoles[votedOne].alive = false
			console.log(votedOne, 'is dead')
			Object.keys(playersList).forEach((name) => {
				io.of(`/${ID}/${name}`).emit('message_recived', { message:`${votedOne} was visited by mafia`, from: 'Host' })
			})
		}
	}
	function NarratePolice(){
		if (decisions.police !== 0){
			Object.values(decisions.police).forEach((votedOne) => {
				console.log(votedOne, playersRoles[votedOne].role=='mafia'?'is mafia':'is not mafia')
				const result = playersRoles[votedOne].role == 'mafia' ? 
				'Sheriff has discovered a mafia':'Sheriff has failed to discover a mafia'
				Object.keys(playersList).forEach((name) => {
					io.of(`/${ID}/${name}`).emit('message_recived', { message: result, from: 'Host' })
				})
			})
		}
	}
	function NarrateDoctor(){
		if (decisions.doctor !== 0){
			Object.values(decisions.doctor).forEach((votedOne) => {
				playersRoles[votedOne].alive = true
				console.log(votedOne, 'was healed')
				Object.keys(playersList).forEach((name) => {
					io.of(`/${ID}/${name}`).emit('message_recived', { message: `${votedOne} was visited by doctor`, from: 'Host' })
				})
			})
		}
	}
	function CheckForVictory(){
		let countMafia = 0
		let countNonMafia = 0
		const playersArr = Object.values(playersRoles)
		playersArr.forEach((player)=>{
			if (player.alive) {
				if (player.role == 'mafia') {
					countMafia += 1
				} else {
					countNonMafia += 1
				}
			}
		})
		if ( countMafia > countNonMafia) {
			Object.keys(playersList).forEach((name) => {
				io.of(`/${ID}/${name}`).emit('message_recived', 
					{ message: `Mafia won`, from: 'Host' })
			})
			clearTimeout(gameTimer)
			return true
			/** */
		} else if (countMafia == 0) {
			Object.keys(playersList).forEach((name) => {
				io.of(`/${ID}/${name}`).emit('message_recived', 
					{ message: `Mafia lost`, from: 'Host' })
			})
			clearTimeout(gameTimer)
			return true
			/** */
		}
		return false
	}
	const RoomNamespace = io.of(`room${ID}`)
	RoomNamespace.on("connection", async (socket) => {
		const { password: authPassword, username: authUsername } = socket.handshake.auth 
		const { password: databasePassword } = await UserFind(authUsername) 
		if(authPassword != databasePassword || !playersIn /*|| online >= 15*/){
			return
		}
		if (!Object.keys(playersList).includes(authUsername)){
			io.of(`/${ID}/${authUsername}`).on("connection", (socket) => {
				console.log('   user conected to chat');
			})
			//const sucses = await RoomAddPlayer(ID)
		}
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
					io.of(`/${ID}/${name}`).emit('message_recived', { message, from })
				})
			}
		})
		socket.on('start', async ({ roles }) => {
			RoomNamespace.emit('start')
			console.log('game has stared', playersList, roles)
			const rolesEntries = Object.entries(roles)
			const roleArray = [];
			for (const [role, count] of rolesEntries) {
				for (let i = 0; i < count; i++) {
					roleArray.push(role);
				}
			}
			shuffleArray(roleArray);
			const namearray = Object.keys(playersList)
			roleArray.forEach((role, i) => {
				if (namearray[i] !== undefined) { // Check if the current element is defined
					const ind = namearray[i];
					playersRoles[ind] = {
						role: role,
						alive: true
					};
					io.of(`/${ID}/${ind}`).emit('assignrole', role)
				}
			});
			playersIn = false
			StartTimer()
		})
		socket.on('vote', ({from, against})=>{
			const id = playersList[from]
			const votingrole = playersRoles[from].role
			if(id != socket.id || gameState != votingrole) {
				return 
			}
			decisions[gameState][from] = against
		})
		socket.on('Restart', () =>{
			SkipTimer()
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
	io.on("connection", (socket) => {
		socket.on("createroom", async ({ userName, JWT, roomname }) => {
			const verified = await UserVerifyJWT(userName, JWT) 
			if (!verified) {
				return
			}
			const room = {
				roomname: roomname,
				online: 0,
				AdminJWT: JWT
			}
			const result = await RoomSave(room)
			if (!result) {
				return
			}
			createRoomNamespace(io, roomname)
			io.emit("room_created", { key: roomname, room: room})
		});
		socket.on("deleteroom", (data) => {
			RoomDelete(data.ID)
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
