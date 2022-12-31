import express from 'express';
import winston from 'winston';
import bootstrap from './bootstrap.js';
import { host, port } from './startup/config.js';

const app = express();

bootstrap(app)

app.listen(port, host, () => {
  winston.info(`Server started at http://${host}:${port}`)
})

export default app