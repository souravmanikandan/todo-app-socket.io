import express from'express';
import http from'http';
import path from'path';
import {Server} from'socket.io';
import {v4 as uuid} from'uuid';

const app = express();

const server = http.createServer(app);

const socketIO = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST"],
        credentials: true,
    },
})

let todoList = [];

const todoListNameSpace = socketIO.of('/todo');
todoListNameSpace.on("connection", (socket) => {
    console.log("new connection established");
    socket.emit('update', todoList);
    socket.on('newItem', (item) => {
        const todoItem = { id: uuid(), value: item};
        todoList.push(todoItem);
        todoListNameSpace.emit("update", todoList);
    })
    socket.on("updateItem", itemObj => {
        const index = todoList.findIndex(item => item.id === itemObj.id);
        if (index !== -1) {
            todoList[index].value = itemObj.value;
            todoListNameSpace.emit("update", todoList);
        }
    })
    socket.on("deleteItem", id => {
        todoList = todoList.filter(x => x.id !== id);
        todoListNameSpace.emit("update", todoList)
    })
    socket.on("disconnect", () => {
        console.log("client disconnected");
    })
})

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "frontend/index.html")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "index.html"));
    })


server.listen(3000, () => {
    console.log('Server is Running on http://localhost:3000');
})