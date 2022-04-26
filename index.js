const path = require('path')
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes/routes');

const MONGODB_URI = 'mongodb+srv://deepak:LHMWm5mwySFXRj8@nodejs.zz6dw.mongodb.net/bms?retryWrites=true&w=majority';

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
)

// app.use(bodyParser.urlencoded()) // x-www-form-urlencoded
app.use(bodyParser.json()) // apllication/json
app.use(compression())
app.use(helmet());
app.use(morgan('tiny', { stream: accessLogStream }))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(routes)

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  return res.status(status).json({ message, data })
})

mongoose.connect(
  MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  }
).then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log('Server is listening on port 5000.')
  })
})