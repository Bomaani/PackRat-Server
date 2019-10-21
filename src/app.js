require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');
const itemsRouter = require('./items/items-router');
const collectionsRouter = require('./collections/collections-router');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use('/packrat/auth', authRouter);
app.use('/packrat/users', usersRouter);
app.use('/packrat/collections', collectionsRouter);
app.use('/packrat/items', itemsRouter);



app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;