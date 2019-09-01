require('custom-env').env(true)

import * as bodyParser from 'body-parser';
// import * as dotenv from 'dotenv';
import * as express from 'express';
import * as morgan from 'morgan';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as compression from 'compression'
var session = require('express-session')
const fileUpload = require('express-fileupload');

import setRoutes from './routes';

const app = express();
// dotenv.load({ path: '.env' });
app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'SECRET' })); // session secret
app.use(compression())


app.use(fileUpload({
    limits: { fileSize: 20 * 1024 * 1024 },
}));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,X-Requested-With,content-type,Authorization,associated_agency');


  next();
});

let mongodbURI;
//if (process.env.NODE_ENV === 'test') {
//  mongodbURI = process.env.MONGODB_TEST_URI;
//} else {
 mongodbURI = process.env.MONGODB_CRED;
  app.use(morgan('dev'));
//}

mongoose.Promise = global.Promise;
const mongodb = mongoose.connect(mongodbURI);

mongodb
  .then((db) => {
    // console.log(process.env)
    console.log('Connected to MongoDB');

    setRoutes(app);

    app.get('/*', function(req, res) {

      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

//    if (!module.parent) {
      app.listen(app.get('port'), () => {
        // console.log(process.env)
        console.log('Angular Full Stack listening on port ' + app.get('port'));
      });
//    }

  })
  .catch((err) => {
    console.error(err);
});

export { app };
