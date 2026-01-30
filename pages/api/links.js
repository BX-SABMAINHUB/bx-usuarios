import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("bx_database"); // Asegúrate de que este es el nombre de tu BD

  if (req.method === "POST") {
    try {
      const { id, url, title, image } = req.body;

      // Validación básica
      if (!id || !url) {
        return res.status(400).json({ error: "Missing ID or URL" });
      }

      const newLink = {
        id,
        url,
        title: title || "Alexgaming",
        image: image || "https://i.ibb.co/vzPRm9M/alexgaming.png",
        createdAt: new Date(),
      };

      await db.collection("links").insertOne(newLink);
      return res.status(200).json({ message: "Link saved successfully" });
    } catch (error) {
      console.error("MONGODB ERROR:", error);
      return res.status(500).json({ error: "Failed to save to database" });
    }
  }

  if (req.method === "GET") {
    try {
      const { id } = req.query;
      const link = await db.collection("links").findOne({ id: id });

      if (link) {
        return res.status(200).json(link);
      } else {
        return res.status(404).json({ error: "Link not found" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
