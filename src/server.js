import connectDB from './db/connection.js';
import { app } from './app.js';

const port = process.env.PORT || 8000;

connectDB().then(() => {
    app.listen(port,()=>{
        console.log(`app is listen on the port : ${port}`);
    });
    app.on("error",(error)=>{
        console.log("Express App error : ",error);
    })
}).catch((error) => {
    console.error("Database connection error : ", error);
})