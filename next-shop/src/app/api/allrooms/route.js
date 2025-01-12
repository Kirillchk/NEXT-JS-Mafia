import rooms from "../../../../data/rooms.json";

export async function GET(request) {
  try {
    // Ensure rooms is an object; if it's a Map, convert it, else keep it as-is
    const roomsObject = rooms instanceof Map ? Object.fromEntries(rooms) : rooms;

    return new Response(JSON.stringify(roomsObject), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing rooms:", error);

    return new Response(
      JSON.stringify({ error: "Failed to fetch rooms data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
