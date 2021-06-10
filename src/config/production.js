import dotenv from "dotenv";
dotenv.config();

const MONGO_URI =
  process.env.MONGO_TYPE +
  "://" +
  process.env.MONGO_USER +
  ":" +
  process.env.MONGO_PASSWORD +
  process.env.MONGO_ADDRESS +
  "/" +
  process.env.MONGO_DATABASE +
  "?" +
  process.env.MONGO_METHOD;

export default MONGO_URI;
