const Database = require("@replit/database")
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");

const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);

const staticDirectory = path.join(__dirname, "html");

app.get("/tile", (req, res) => {
    console.log('hello')
    // io.sockets.emit("colorUpdate", "63 49 10")
    res.send(200, { response: 'response 1' });
})


app.use(express.static(staticDirectory));
httpserver.listen(3000);

const BOARD_KEY = "board";
const BOARD_SIZE = 100;

const db = new Database()

var board = null;

db.get(BOARD_KEY).then(value => {
    if (!value) {
        console.log("setting BOARD_KEY")
        board = []
        for (let i = 0; i < BOARD_SIZE; i++) {
            board.push([])
            for (let j = 0; j < BOARD_SIZE; j++) {
                board[i].push("5") // default to cornflower blue
            }
        }
        db.set(BOARD_KEY, board)
    } else {
        board = value
    }
});

io.on('connection', function(socket) {

    socket.on("join", function(room, username) {
        initString = ""
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 100; j++) {
                initString += i + " " + j + " " + board[i][j] + "\n"
            }
        }
        socket.emit("colorUpdate", initString)
    })

    socket.on("send", function(message) {
        io.sockets.emit("colorUpdate", message)
        
        var [row, col, value] = message.split(" ")        
        board[row][col] = value

        db.set(BOARD_KEY, board).then( () => {
        })
    })
})
