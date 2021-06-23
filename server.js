require('dotenv').config()
const express= require('express');
const app=express();
const ejs =require('ejs');
const path=require('path');
const expressLayout =require("express-ejs-layouts"); 
require('mongodb');
const mongoose= require("mongoose");
const session= require("express-session");
const flash=require("express-flash");
const passport = require('passport');
const MongoDbStore=require("connect-mongo")(session);
const Emitter = require('events')


const PORT=process.env.PORT||9000;

//database connection
const url='mongodb://localhost/brownies';
mongoose.connect(url,{useNewUrlParser:true, useCreateIndex:true, useUnifiedTopology:true, useFindAndModify:true});
const connection=mongoose.connection;
connection.once('open',()=>{
    console.log("Database connected.......");
}).catch(err=>{
    console.log("connection failed......")
});



//session store
let mongoStore=new MongoDbStore({
    mongooseConnection:connection,
    collection:'sessions'
})

//emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

//session config............it works as a middleware
app.use(session({
    secret:process.env.COOKIE_SECRET,          //cookies
    resave:false,
    store:mongoStore,
    saveUninitialized:false,
     cookie:{maxAge:1000*60*60*24} //24hrs            //life time of cookie in mili sec
}))

//passport config
const passportInit=require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())


app.use(flash());


app.use(express.static('public'));

app.use(express.urlencoded({extended:false}))
app.use(express.json())


//global middleware
app.use((req,res,next)=>{
    res.locals.session = req.session
    next()
})

app.use((req,res,next)=>{
    res.locals.user = req.user
    next()
})


//set Template Engine
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views/"));


app.set('view engine', 'ejs'); 

require('./routes/web')(app)


const server = app.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`)
});

//socket
const io = require('socket.io')(server)
io.on('connection' , (socket) => {
    //join 
    socket.on('join', (orderId) => {
           socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated', (data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated',data)
})
eventEmitter.on('orderPlaced', (data)=>{
    io.to('adminRoom').emit('orderUpdated',data)
})