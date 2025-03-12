import { RoomsFindAll } from '@/data/models.mjs'

export async function GET() {
  try {
    const roomsObject = await RoomsFindAll()
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