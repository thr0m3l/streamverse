const express = require('express');
const bodyParser = require('body-parser');
const usersRoutes = require('./routes/users-routes');
const profileRoutes = require('./routes/profile-routes');
const browseRoutes = require('./routes/browse-routes');
const subscriptionRoutes = require('./routes/subscription-routes');
const HttpError = require('./models/http-error');
const database = require('./services/database');

const app = express();
//Establishes database connection
async function startup() {
  try {
    console.log('Initializing database module');
  
    await database.initialize();
  } catch (err) {
    console.error(err);
    process.exit(1); // Non-zero failure code
  }
}

startup();

app.use(bodyParser.json());


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  
    next();
  });


app.use('/api/users', usersRoutes);

app.use('/api/profiles', profileRoutes);

app.use('/api/browse', browseRoutes);

app.use('/api/subscription',subscriptionRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occurred'})
});

app.listen(5000);
