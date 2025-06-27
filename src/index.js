import dotenv from "dotenv";

import connectDB from "./db/index.js";

import {app} from "./app.js";

dotenv.config({
    path: "./.env",
});


connectDB()
.then(() => {
    app.on("error",(error)=>{
        console.log("ERR : ", error);   // this catches any error that occurs in our express application
        throw error;
    })
    app.listen((process.env.PORT || 8000),()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.error("Server failed to start:", error);
    process.exit(1);
});
