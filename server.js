const express = require('express');
const app = express();
module.exports = app;
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');

const PORT = process.env.PORT || 3000;




// Middleware to parse incoming request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Middleware for logging HTTP requests
app.use(morgan('dev'));

// Middleware for handling errors
app.use(errorHandler());


const apiRouter = require('./src/api/api');
app.use('/api', apiRouter);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});