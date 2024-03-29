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
const { coinSockets, coinRoomEvents, initialCoinRoomEvent } = require('./Rooms/coinRoom');
const { lineSockets, lineRoomEvents, initialLineRoomEvent } = require('./Rooms/lineRoom');
const { crashSockets, crashRoomEvents, initialCrashRoomEvent } = require('./Rooms/crashRoom');
const { getBetHistory } = require('./services/getBetHistory');
const { higherLowerSockets, initialHigherLowerRoomEvent, higherLowerRoomEvents } = require('./Rooms/higherLowerRoom');

//TEST
// const io = require('socket.io')(httpServer, {
//   cors: { origins: 'http://localhost:4200' }
// });
//TEST

//PROD
const io = require('socket.io')(httpServer, {
  cors: { origins: 'https://debils.gay' }
});
//PROD

mongoose.connect(process.env.MONGOOSE);

const port = process.env.PORT || 3000;

wheelRoom = 'wheel';
coinRoom = 'coin';
lineRoom = 'line';
crashRoom = 'crash';
higherLowerRoom = 'higherLower';

app.set("trust proxy", 1);

//TESTING
// app.use(cors({
//   origin: ['http://localhost:4200'],
//   credentials: true
// }));

// app.use(session({
//   secret: process.env.COOKIE,
//   name: 'SausainiukasGuminiukas',
//   cookie: {
//     secure: false,
//     maxAge: 2592000000 //menesis
//   },
//   resave: false,
//   saveUninitialized: false,
//   store: Store.create({ mongoUrl: process.env.MONGOOSE })
// }));
//TESTING

//PROD
app.use(cors({
  origin: ['https://debils.gay'],
  credentials: true
}));

app.use(session({
  secret: process.env.COOKIE,
  name: 'SausainiukasGuminiukas',
  cookie: {
    domain: 'debils.gay',
    sameSite: 'none',
    httpOnly: false,
    secure: true,
    maxAge: 2592000000 //menesis
  },
  resave: false,
  saveUninitialized: false,
  store: Store.create({ mongoUrl: process.env.MONGOOSE })
}));
//PROD

app.use(passport.initialize());
app.use(passport.session());
app.use('/api', routes);

wheelSockets(io);
coinSockets(io);
lineSockets(io);
crashSockets(io);
higherLowerSockets(io);

io.on("connection", async (socket) => {
  console.log("CONNECT");

  socket.on('join', roomName => {
    if (roomName == wheelRoom) {
      console.log("join wheel");
      leaveRoom(socket);
      socket.join(wheelRoom);
      initialWheelRoomEvent(socket);
      //remove socket from room if is in another room
    } else if (roomName == coinRoom) {
      console.log('joinCoin');
      leaveRoom(socket);
      socket.join(coinRoom);
      initialCoinRoomEvent(socket);
      //initialCoinRoomEvent(socket);
      //remove socket from room if is in another room
    } else if (roomName == lineRoom) {
      console.log('joinLine');
      leaveRoom(socket);
      socket.join(lineRoom);
      initialLineRoomEvent(socket);
      //remove socket from room if is in another room
    } else if (roomName == crashRoom) {
      console.log('crashRoom');
      leaveRoom(socket);
      socket.join(crashRoom);
      initialCrashRoomEvent(socket);
      //remove socket from room if is in another room
    } else if (roomName == higherLowerRoom) {
      console.log('higherlower');
      leaveRoom(socket);
      socket.join(higherLowerRoom);
      initialHigherLowerRoomEvent(socket);
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
    } else if (io.sockets.adapter.rooms.get(higherLowerRoom) && io.sockets.adapter.rooms.get(higherLowerRoom).has(socket.id)
      && eventobject.room === higherLowerRoom) {
      higherLowerRoomEvents(socket, eventobject);
    }
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected!');
    //remove socket from room
  });
});

function leaveRoom(socket) {
  if (io.sockets.adapter.rooms.get(wheelRoom) && io.sockets.adapter.rooms.get(wheelRoom).has(socket.id)) {
    socket.leave(wheelRoom);
  } else if (io.sockets.adapter.rooms.get(coinRoom) && io.sockets.adapter.rooms.get(coinRoom).has(socket.id)) {
    socket.leave(coinRoom);
  } else if (io.sockets.adapter.rooms.get(lineRoom) && io.sockets.adapter.rooms.get(lineRoom).has(socket.id)) {
    socket.leave(lineRoom);
  } else if (io.sockets.adapter.rooms.get(crashRoom) && io.sockets.adapter.rooms.get(crashRoom).has(socket.id)) {
    socket.leave(crashRoom);
  } else if (io.sockets.adapter.rooms.get(higherLowerRoom) && io.sockets.adapter.rooms.get(higherLowerRoom).has(socket.id)) {
    socket.leave(higherLowerRoom);
  }
}

require('./services/resetGetLives.js')();

httpServer.listen(port, () => console.log(`listening on port ${port}`));