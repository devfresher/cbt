import express from 'express';
import winston from 'winston';

const app = express();

import { log } from './startup/logging.js';
import { route } from './startup/routes.js';
import dbConnect from './startup/db.js';

log(); route(app); dbConnect()

import { host, port } from './startup/config.js';
app.listen(port, host, () => {
  winston.info(`Server started at http://${host}:${port}`)
})

export default app