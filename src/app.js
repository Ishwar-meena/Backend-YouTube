import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors';
import express from "express";


dotenv.config({
    path: "./.env"
});

const app = express();
const port = process.env.PORT || 8000;
const whitelist = [`http://localhost:${port}`, `http://127.0.0.1:${port}`];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors(corsOptions));
app.use(express.json({ limit: "12kb" }));
app.use(express.urlencoded({ limit: "12kb" }));
app.use(cookieParser())

import registerRoute from "./routes/user.routes.js";
import videoRoute from "./routes/video.routes.js"
import commentRoute from "./routes/comment.routes.js"
import tweetRoute from "./routes/tweet.routes.js"
import playlistRoute from "./routes/playlist.routes.js"
import likeRoute from "./routes/like.routes.js"
import healthRoute from "./routes/healthcheck.routes.js"
import dashboardRoute from "./routes/dashboard.routes.js"
// routes 
app.use('/api/v1/users',registerRoute);
app.use("/api/v1/video",videoRoute);
app.use("/api/v1/comment",commentRoute)
app.use("/api/v1/tweets",tweetRoute)
app.use("/api/v1/playlist",playlistRoute)
app.use("/api/v1/like",likeRoute);
app.use("/api/v1/health",healthRoute)
app.use("/api/v1/dashboard",dashboardRoute);
export { app };