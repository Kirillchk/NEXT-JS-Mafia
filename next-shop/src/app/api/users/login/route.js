import { UserFind } from '@/data/models.mjs'

export async function POST(request) {
	const { username, password } = await request.json()
	const userData = await UserFind(username)
	console.log(userData)

	return new Response(JSON.stringify({ JWT: userData.JWT}), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});



//  try {
//		const data = await request.json()
//		const userData = returnDataObjectByKey(filePath, data.username)
//		if (!userData){
//			return new Response('no such name', {
//				status: 400,
//				headers: { "Content-Type": "application/json" },
//			});
//		} 
//		if (userData.password !== data.password) {
//			return new Response('incorrect password', {
//				status: 400,
//				headers: { "Content-Type": "application/json" },
//			});
//		}
//    return new Response(JSON.stringify({ JWT: userData.JWT}), {
//      status: 200,
//      headers: { "Content-Type": "application/json" },
//    });
//  } catch (error) {
//    console.error("Error processing users:", error);

//    return new Response(
//      JSON.stringify({ error: "Failed to fetch users data" }),
//      {
//        status: 500,
//        headers: { "Content-Type": "application/json" },
//      }
//    );
//  }
}