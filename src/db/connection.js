import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`Mongodb connected successfully HOST : ${connectionInstance.connection.host} PORT : ${connectionInstance.connection.port}`);
    } catch (error) {
        console.error("Mongodb connection error : ", error);
        process.exit(1);
    }
}

export default connectDB;
