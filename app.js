import express from 'express';
import winston from 'winston';

export const app = express();

import { log } from './startup/logging.js';
import { route } from './startup/routes.js';

log(); route(app);

import { host, port } from './startup/config.js';
app.listen(port, host, () => {
  winston.info(`Server started at http://${host}:${port}`)
})