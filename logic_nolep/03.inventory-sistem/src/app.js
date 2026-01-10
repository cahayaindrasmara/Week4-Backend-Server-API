import express from 'express';
import routes from './routes/index.js';
import morgan from './config/morgan.js';
import config from './config/config.js';
import { errorConverter, errorHandler } from './middlewares/error.js';
import ApiError from './utils/ApiError.js';
import {status} from 'http-status';

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler)
}
//aktifin parsing json
app.use(express.json());
//aktifin urlencoded
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!!!');
});

app.use('/api', routes);

//send 404 error jika route tidak ada
app.use((req, res, next) => {
  next(new ApiError(status.NOT_FOUND, 'Not Found'))
})

//convert error jadi Instance Api Error jika ada error yang tidak ke tangkap
app.use(errorConverter);

//handle error
app.use(errorHandler);

export default app;
