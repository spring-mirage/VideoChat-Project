import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { roomHandle } from './room';

const port = 6001;
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {

    console.log("user is connected");
    roomHandle(socket);
    socket.on("disconnect", () => {
        console.log("user is disconnected");
    })
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/', (_, res) => {
    res.send('Hello World!');
});
