import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import { generateFakeData } from "../faker";
import { userRouter, blogRouter } from "./routes";
import { Key } from "./config/keys";

const app = express();
dotenv.config();

const server = async () => {
  try {
    let mongoConnection = await mongoose.connect(Key, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    mongoose.set("debug", true); // for dev
    await generateFakeData(20, 5, 50);
    console.log("DB is connected ...");

    app.set("port", process.env.PORT ? process.env.PORT : 5000);
    app.use(express.json()); // json 형식 허용
    app.use(
      process.env.NODE_ENV === "dev" ? morgan("dev") : morgan("combined")
    );
    app.use("/user", userRouter);
    app.use("/blog", blogRouter);

    app.listen(app.get("port"), () => {
      console.log("listening port " + app.get("port"));
    });
  } catch (err) {
    console.error(err);
  }
};
server();
