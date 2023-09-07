const express = require("express");
const dotenv = require("dotenv");
const {chats} = require("./data/data");
const connectDB = require("./config/db");
const userRoutes= require("./routes/userRoutes");
const chatRoutes= require("./routes/chatRoutes");
const messageRoutes= require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();


const app = express();
connectDB();


app.use(express.json());
app.get("/",(req, res) => {
    res.send("API is running successfully");

});

app.use('/api/user',userRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/message",messageRoutes);


app.use(notFound);
app.use(errorHandler);

/*app.get('/api/chat',(req , res) => {
    res.send(chats)
})

app.get('/api/chat/:id', (req,res) => {
    //console.log(req.params.id);
    const singleChat= chats.find(c =>c._id === req.params.id );
    res.send(singleChat);
});*/

const PORT = process.env.PORT || 5000



const server= app.listen(5000,console.log(`Server started on port ${PORT}`.yellow.bold));
const io= require('socket.io')(server,{
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on("connection",(socket) => {
    console.log('connected socket.io');

    socket.on("setup",(userData)=>{
socket.join(userData._id);
socket.emit("connected");
    });

    socket.on("join chat",(room)=> {
        socket.join(room);

    });


    socket.on("new message",(newMessageRecieved)=> {
        var chat= newMessageRecieved.chat;

        if(!chat.users) return console.log("chat.users not defined");

        chat.users.forEach(user => {
            if(user._id == newMessageRecieved.sender._id) return;

           socket.in(user._id).emit("message recieved",newMessageRecieved);
        });
    });
});
