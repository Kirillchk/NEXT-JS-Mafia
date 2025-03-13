import { UserSave } from '@/data/models.mjs'
import { v4 } from 'uuid'

export async function POST(request) {
	const JWT = await v4()
	const { username, password } = await request.json()
	const saveSucses = await UserSave({ username, password, JWT })
	if (saveSucses) {
		return new Response(JSON.stringify({JWT}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} else {
		return new Response(
			JSON.stringify({ error: "Failed to create user" }),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

}