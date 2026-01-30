import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("bx_database");

  if (req.method === "POST") {
    const newLink = req.body;
    await db.collection("links").insertOne(newLink);
    return res.status(200).json({ message: "Link guardado" });
  }

  if (req.method === "GET") {
    const { id } = req.query;
    const link = await db.collection("links").findOne({ id: id });
    return res.status(200).json(link);
  }
}
