// server.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const app = express();
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev')); // HTTP request logger
app.use('/api', routes);

// health
app.get('/', (req, res) => res.send('API is up'));

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
