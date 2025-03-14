import mongoose from "mongoose"

mongoose.connect("mongodb://localhost:27017/mafia");

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		minlength: 6,
		maxlength: 36
	},
	password: {
		type: String,
		required: true,
		minlength: 4,
		maxlength: 16
	},
	JWT: {
		type: String,
		required: true,
	}
}, { versionKey: false })

const roomSchema = new mongoose.Schema({
	roomname: {
		type: String,
		required: true,
		unique: true,
	},
	online: {
		type: Number,
		required: true,
		min: 0,
		max: 15
	},
	AdminJWT: {
		type: String,
		required: true,
	},
}, { versionKey: false })

const UsersModel = mongoose.models.user || mongoose.model('user', userSchema);
const RoomsModel = mongoose.models.room || mongoose.model('room', roomSchema);

export async function UserSave(newUser){
	try {
		const user = new UsersModel(newUser)
		await user.save()
		return true
	} catch (error) {
		return false
	}
}

export async function UserFind(username) {
	try {
		const user = await UsersModel.findOne({ username: username }).exec();
		return user
	} catch (error) {
		console.error('Error finding user:', error);
		return false
	}
}

export async function UserVerifyJWT(username, JWT) {
	const user = await UserFind(username)
	if (user == null || user.JWT != JWT) {
		return false
	} else {
		return true
	}
}

export async function RoomSave(newUser){
	try {
		const room = new RoomsModel(newUser)
		await room.save()
		return true
	} catch (error) {
		return false
	}
}

export async function RoomFind(roomname) {
	try {
		const room = await RoomsModel.findOne({ roomname: roomname}).exec();
		return room
	} catch (error) {
		console.error('Error finding room:', error);
		return null
	}
}

export async function RoomDelete(roomname) {
	try {
		await RoomsModel.findOneAndDelete({roomname: roomname})
		return true
	} catch (error) {
		return false
	}
}

export async function RoomAddPlayer(_id) {
	const room = RoomFind(_id)
	room.online += 1
	try {
		await RoomsModel.findByIdAndUpdate( {_id}, room)
		return true
	} catch (error) {
		return false
	}
}

export async function RoomsFindAll(){
	try {
		const rooms = await RoomsModel.find({})
		return rooms
	} catch (error) {
		return null
	}
}