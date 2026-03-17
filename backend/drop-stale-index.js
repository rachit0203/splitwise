import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected");

const col = mongoose.connection.collection("users");
const indexes = await col.indexes();
console.log("Current indexes:", indexes.map((i) => i.name));

if (indexes.some((i) => i.name === "username_1")) {
  await col.dropIndex("username_1");
  console.log("Dropped stale index: username_1");
} else {
  console.log("No username_1 index found.");
}

await mongoose.disconnect();
console.log("Done.");
process.exit(0);
