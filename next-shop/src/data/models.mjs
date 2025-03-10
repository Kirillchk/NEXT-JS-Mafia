import mongoose from "mongoose"

mongoose.connect("mongodb://localhost:27017/mafia");

const UsersModel = mongoose.model('user',  
	new mongoose.Schema({
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
)

const RoomsModel = mongoose.model('room',  
	new mongoose.Schema({
		roomname: {
			type: String,
			required: true,
			unique: true,
		},
		username: {
			type: Number,
			required: true,
			min: 0,
			max: 15
		},
	}, { versionKey: false })
)

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
		const user = await UsersModel.findOne({ username }).exec();
		return user
	} catch (error) {
		console.error('Error finding user:', error);
		return null
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

export async function RoomSave(newRoom) {
	try {
		const room = new RoomsModel(newRoom)
		await room.save()
		return true
	} catch (error) {
		return false
	}
}

/**/
export async function RoomFind(_id) {
	try {
		const room = await UsersModel.findById(_id);
		return room
	} catch (error) {
		console.error('Error finding room:', error);
		return null
	}
}

/**/
export async function RoomDelete(ID) {
	try {
		await RoomsModel.findByIdAndDelete(ID)
		return true
	} catch (error) {
		return false
	}
}

/**/
export async function RoomAddPlayer(params) {
	
}







