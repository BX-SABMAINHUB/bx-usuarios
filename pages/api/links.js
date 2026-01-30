import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("bx_database");

  if (req.method === "GET") {
    const { id } = req.query;
    const link = await db.collection("links").findOne({ id: id });
    if (link) {
      return res.status(200).json(link);
    }
    return res.status(404).json({ error: "No encontrado" });
  }

  if (req.method === "POST") {
    const data = req.body; // Aquí recibe lo que envías desde el Dashboard
    await db.collection("links").insertOne(data);
    return res.status(200).json({ success: true });
  }
}
