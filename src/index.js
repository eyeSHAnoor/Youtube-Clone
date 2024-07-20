// require('dotenv').config({path: './env'})

import dotenv from "dotenv";
dotenv.config({
  path: "./env",
});

import connectDB from "./db/db.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log("ERROR is : ", err);
      throw err;
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("the errror is : ", err);
  });
