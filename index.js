import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

const client = new MongoClient(`mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.v1cym2i.mongodb.net/`);

async function connectToMongoDB() {
  try {
    await client.connect();

    console.log("You successfully connected to MongoDB!");

    return client.db("simpleclurd");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

const db = await connectToMongoDB();
const users = db.collection("users");


app.get('/', (req, res) => {
  res.send('Server is running!');
});


app.get("/users",async(req,res)=>{
  const cursor = users.find({});
    const allValues = await cursor.toArray();
     res.send(allValues)
})

app.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid user ID" });
    }

    const query = { _id: new ObjectId(id) };
    const result = await users.findOne(query);

    if (!result) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
});


app.delete("/users/:id", async (req, res) => {
  
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await users.deleteOne(query);
     res.send(result)
  
});



app.post("/users", async (req, res) => {
  try {
    const newuser = req.body;

    const result = await users.insertOne(newuser);

    res.status(201).send({
      message: "User added successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Failed to add user:", error);

    res.status(500).send({
      message: "Failed to add user",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

