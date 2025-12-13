import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectToMongoDB from "./database/connect.ts";
import mongoose from "mongoose";

dotenv.config();
const PORT = process.env.PORT || 7000;

const app = express();
app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.clear();
  console.log("Server Started, Listening on : ", PORT);
  const DB_URL = process.env.MONGO_DB_URL;
  const connectionConfig: mongoose.ConnectOptions = {};
  if (!DB_URL) {
    throw new Error("Pffff ! Mongo DB Connetion URL not found!");
  }
  connectToMongoDB(DB_URL, connectionConfig)
    .then((response) => {
      console.log("Database connect Success !");
    })
    .catch((error) => {
      console.error("Connect Error", error);
    });
});
