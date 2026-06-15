import express from 'express';
import { status } from 'http-status';
// import routes from './routes/index.js';
import routes from './routes/v1/index.js';
import morgan from './config/morgan.js';
import config from './config/config.js';
import { errorConverter, errorHandler } from './middlewares/error.js';
import ApiError from './utils/ApiError.js';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimiter from './config/rateLimiter.js';
import passport from 'passport';
import jwtStrategy from './config/passport.js';

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

//set security HTTP Headers
app.use(helmet());

//aktifin parsing json
app.use(express.json());

//aktifin urlencoded
app.use(express.urlencoded({ extended: true }));

//gzip compression
app.use(compression());

//enable cors
app.use(cors());
app.options(/.*/, cors());

//rate limiter enable
app.use('/api', rateLimiter);

//jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

app.get('/', (req, res) => {
  res.send('Hello World!!!');
});

// app.use('/api', routes);

//v1 api routes
app.use('/v1', routes);

//send 404 error jika route tidak ada
app.use((req, res, next) => {
  next(new ApiError(status.NOT_FOUND, 'Not Found'));
});

//convert error jadi Instance Api Error jika ada error yang tidak ke tangkap
app.use(errorConverter);

//handle error
app.use(errorHandler);

export default app;
