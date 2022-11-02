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

const BetObject = require('./objects/betObject');
const BetResponseObject = require('./objects/betResponseObject');
const RoomObject = require('./objects/roomObject');
const BetResultService = require('./services/betResultService');

const {getApiToken} = require('./services/api');


const io = require('socket.io')(httpServer, {
  cors: { origins: '*' }
});

mongoose.connect(process.env.MONGOOSE);

const port = process.env.PORT || 3000;

sliceSize = 360 / 20;
count = 0;
rotation = 0;
endSpin = false;
timeTillnextSpin = 10;
spinValue = 0;
wheelMessages = [];
wheelBets = [];
wheelClientMessages = [];
ableToBetWheel = true;

wheelValues = ['W', '1', '8', '15', '4', '11', '18', '7', '14', '3', 'X', '10', '17', '6', '13', '2', '9', '16', '5', '12'];
wheelColors = ['violetinis', 'žalias', 'mėlynas', 'raudonas', 'žalias', 'mėlynas', 'raudonas', 'žalias', 'mėlynas', 'raudonas', 'geltonas', 'žalias', 'mėlynas', 'raudonas', 'žalias', 'mėlynas', 'raudonas', 'žalias', 'mėlynas', 'raudonas'];

timeBetweenSpins();

console.log(BetResultService.getBetStatus("colorGreen", 1, wheelValues, wheelColors));

app.use(cors({
  origin: ['http://localhost:4200'],
  credentials: true
}))

app.use( session ({
  secret: 'secret',
  cookie: {
    maxAge: 60000 * 60 * 24
  },
  resave: false,
  saveUninitialized: false,
  store: Store.create({mongoUrl: process.env.MONGOOSE})
}))

app.use( passport.initialize());
app.use( passport.session());
app.use('/api', routes);

getApiToken();

io.on("connection", (socket) => {
  console.log("CONNECT");
  console.log(socket.id);

  socket.on('getWheelMessages', () => {
    socket.emit('wheelMessages', wheelMessages);
  });

  socket.emit('initialWheelPos', count);

  socket.on('bet', clientBet => {
    if (ableToBetWheel) {
      const newBet = new BetObject(socket.id, clientBet.clientId, Math.abs(clientBet.betAmount), clientBet.prediction);
      console.log(clientBet);
      console.log(newBet);
      wheelBets.push(newBet);
    } else {
      socket.emit('betError', true);
    }
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected!');
  });
});

function spin() {
  let WheelSpin = setInterval(function () {
    io.sockets.emit('wheelPos', count);
    if (endSpin) {
      clearInterval(WheelSpin);
    }
  }, 0);

  let SpinCount = setInterval(function () {
    if (count <= rotation) {
      if (count + 200 < rotation) {
        count += 5;
      } else {
        count += 1;
      }
    } else {
      endSpin = true;
      wheelMessages.push('Ratas išsuko ' + wheelColors[spinValue] + ' ' + wheelValues[spinValue]);
      sendStatusToClient();
      getClientStatusToMessage();
      console.log("clear");
      clearInterval(SpinCount);
      setTimeout(() => {
        ableToBetWheel = true;
        wheelBets = [];
        timeBetweenSpins();
      }, 5000);
    }
  }, 0);
}

function timeBetweenSpins() {
  let spinTimer = timeTillnextSpin;
  let spinTime = setInterval(function () {
    io.sockets.emit('timeTillSpin', spinTimer);
    spinTimer--;
    if (spinTimer < 0) {
      clearInterval(spinTime);
      io.sockets.emit('resetWheel', true);
      setTimeout(function () {
        io.sockets.emit('initialWheelPos', 0);
      }, 60);
      setTimeout(function () {
        io.sockets.emit('startSpin', true);
      }, 120);
      setTimeout(function () {
        ableToBetWheel = false;
        setSpin();
      }, 180);
    }
  }, 1000);
}

function setSpin() {

  let spinIndex = Math.floor(Math.random() * 20);

  spinValue = spinIndex;

  endSpin = false;
  const rotMin = (this.sliceSize * (spinIndex)) - (this.sliceSize / 5);
  const rotMax = (this.sliceSize * (spinIndex)) + (this.sliceSize / 5);

  const fullRots = Math.floor(Math.random() * 5) + 5; // minimum 5 rotations max 9

  count = 0;

  const rot = (fullRots * 360) + Math.floor(Math.random() * (rotMax - rotMin + 1) + rotMin);
  rotation = rot;

  console.log("START SPIN");
  spin();
}

function sendStatusToClient() {
  wheelBets.forEach(bet => {
    const response = new BetResponseObject();
    const betResult = BetResultService.getBetStatus(bet.prediction, spinValue, wheelValues, wheelColors);
    response.status = betResult == 0 ? false : true;
    response.amount = bet.betAmount * betResult;
    io.to(bet.socketId).emit(response);
  });
}

function getClientStatusToMessage() {
  wheelBets.forEach(bet => {
    const betResult = BetResultService.getBetStatus(bet.prediction, spinValue, wheelValues, wheelColors);
    let newMessage = bet.clientId + ' ';
    newMessage += (betResult == 0 ? 'pralaimėjo' : 'laimėjo') + ' ';
    newMessage += (betResult == 0 ? bet.betAmount : bet.betAmount * betResult);
    wheelMessages.push(newMessage);
  });
}

httpServer.listen(port, () => console.log(`listening on port ${port}`));