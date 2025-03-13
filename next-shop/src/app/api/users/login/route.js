import { UserFind } from '@/data/models.mjs'

export async function POST(request) {
	const { username, password } = await request.json()
	const userData = await UserFind(username)
	if (userData != null) {
		return new Response(JSON.stringify({ JWT: userData.JWT}), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});	
	} else {
		return new Response(JSON.stringify('erorr because... because'), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});	
	}
}