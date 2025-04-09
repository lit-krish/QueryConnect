import express from "express"
import {mongoose} from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import routes from "./Routes/Teacher.js"
import cookieParse from "cookie-parser"
import {Server} from "socket.io"
import http from "http"
import videocall from "./Controllers/videocall.js" 

const app=express()

app.use(cors())
app.use(express.json())
app.use(cookieParse())
app.use(express.urlencoded({ extended: true }));


dotenv.config()

app.use(routes)

const server=http.createServer(app)
const io=new Server(server,{
    cors:{
        origin:["http://localhost:5173","http://localhost:3000"],
        methods:["GET","POST"]
    }
})

videocall(io)

app.get("/",(req,res)=>{
    res.send("Server running on port 8000")
})

server.listen(8000,()=>{
    console.log("Server running on port 8000")
})

mongoose.connect(process.env.mongoURL).then(()=>{
    console.log("Database connected")
})
