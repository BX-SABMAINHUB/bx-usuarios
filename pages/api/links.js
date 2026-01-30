import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("bx_database"); // Así se llamará tu base de datos

  if (req.method === "GET") {
    const { id } = req.query;
    const link = await db.collection("links").findOne({ id: id });
    if (link) {
      return res.status(200).json(link);
    } else {
      return res.status(404).json({ error: "Link no encontrado" });
    }
  }
  
  // Si tu Dashboard envía datos, este código los guarda
  if (req.method === "POST") {
    const data = req.body;
    await db.collection("links").insertOne(data);
    return res.status(200).json({ success: true });
  }
}
