require('dotenv').config();
require('./strategies/discord');

const app = require('express')();
const httpServer = require('http').createServer(app);
const passport = require('passport');
const routes = require('./routes/router');
const mongoose = require('mongoose');
const session = require('express-session');
const Store = require('connect-mongo');
const cors = require('cors');

const { wheelSockets, initialWheelRoomEvent, wheelRoomEvents } = require('./Rooms/wheelRoom');
const { coinSockets, coinRoomEvents } = require('./Rooms/coinRoom');
const { lineSockets, lineRoomEvents } = require('./Rooms/lineRoom');
const { crashSockets, crashRoomEvents } = require('./Rooms/crashRoom');


const io = require('socket.io')(httpServer, {
  cors: { origins: '*' }
});

mongoose.connect(process.env.MONGOOSE);

const port = process.env.PORT || 3000;

wheelRoom = 'wheel';
coinRoom = 'coin';
lineRoom = 'line';
crashRoom = 'crash';

app.use(cors({
  origin: ['http://localhost:4200'],
  credentials: true
}))

app.use(session({
  secret: 'secret',
  cookie: {
    maxAge: 60000 * 60 * 24
  },
  resave: false,
  saveUninitialized: false,
  store: Store.create({ mongoUrl: process.env.MONGOOSE })
}))

app.use(passport.initialize());
app.use(passport.session());
app.use('/api', routes);

wheelSockets(io);
coinSockets(io);
lineSockets(io);
crashSockets(io);

io.on("connection", (socket) => {
  console.log("CONNECT");

  socket.on('join', roomName => {
    if (roomName == wheelRoom) {
      console.log("join wheel");
      socket.join(wheelRoom);
      initialWheelRoomEvent(socket);
      //remove socket from room if is in another room
    } else if (roomName == coinRoom) {
      console.log('joinCoin');
      socket.join(coinRoom);
      //initialCoinRoomEvent(socket);
      //remove socket from room if is in another room
    } else if (roomName == lineRoom) {
      console.log('joinLine');
      socket.join(lineRoom);
      //remove socket from room if is in another room
    } else if (roomName == crashRoom) {
      console.log('crashRoom');
      socket.join(crashRoom);
      //remove socket from room if is in another room
    }
  });

  socket.on('event', (eventobject) => {
    if (io.sockets.adapter.rooms.get(wheelRoom) && io.sockets.adapter.rooms.get(wheelRoom).has(socket.id)
      && eventobject.room === wheelRoom) {
      wheelRoomEvents(socket, eventobject);
    } else if (io.sockets.adapter.rooms.get(coinRoom) && io.sockets.adapter.rooms.get(coinRoom).has(socket.id)
      && eventobject.room === coinRoom) {
      coinRoomEvents(socket, eventobject);
    } else if (io.sockets.adapter.rooms.get(lineRoom) && io.sockets.adapter.rooms.get(lineRoom).has(socket.id)
      && eventobject.room === lineRoom) {
      lineRoomEvents(socket, eventobject);
    } else if (io.sockets.adapter.rooms.get(crashRoom) && io.sockets.adapter.rooms.get(crashRoom).has(socket.id)
      && eventobject.room === crashRoom) {
      crashRoomEvents(socket, eventobject);
    }
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected!');
    //remove socket from room
  });
});

httpServer.listen(port, () => console.log(`listening on port ${port}`));