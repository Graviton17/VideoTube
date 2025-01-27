import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
        });
        console.log("Connected to the Database");
    } catch (error) {
        console.error("Error connecting to the Database: ", error);
    }
}

export { connectDB };