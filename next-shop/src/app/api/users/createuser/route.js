import { addKeyValueToJSON, hasEntries } from '@/data/manage.mjs'

const filePath = './src/data/users.json'

export async function POST(request) {
  try {
		const data = await request.json()
		if (hasEntries(filePath, data.username)) {
			return new Response('name already taken', {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const JWT = require('jsonwebtoken')
		const date = new Date()
		const today = `${date.getMinutes()}${date.getHours()}${date.getDate()}${date.getMonth()}`

		const newrecord = {
			password: data.password,
			JWT: JWT.sign({ date: today}, data.password)
		}
		addKeyValueToJSON(filePath, data.username, newrecord)
    return new Response('Acount created', {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing users:", error);

    return new Response(
      JSON.stringify({ error: "Failed to fetch users data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}