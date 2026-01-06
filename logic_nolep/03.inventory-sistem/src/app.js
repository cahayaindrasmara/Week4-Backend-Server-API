import express from 'express';
import routes from './routes/index.js';
import {successHandler, errorHandler} from './config/morgan.js';
import config from './config/config.js';

const app = express();

if (config.env !== 'test') {
  app.use(successHandler);
  app.use(errorHandler)
}
//parsing json
app.use(express.json());
//urlencoded
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!!!');
});

app.use('/api', routes);

export default app;
