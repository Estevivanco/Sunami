import mongoose from 'mongoose';

const connectDB = async () => {
  // Reuse an existing connection (important for serverless cold/warm starts)
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn.connection;
};

export default connectDB;
