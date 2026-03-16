import mongoose from "mongoose";
const connectDB = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing");
  }

  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });

  console.log("MongoDB connected");
};

export default connectDB;