import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
 
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected successfully! DB Host :${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Could not connect to the MongoDB database:", error);
        process.exit(1);
    }
}

export default connectDB;