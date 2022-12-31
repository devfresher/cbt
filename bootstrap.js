import * as asyncErrors from 'express-async-errors'
import logger from './startup/logger.js';
import routeApp from './startup/routes.js';
import dbConnect from './startup/db.js';

export default (app) => {
    dbConnect();
    logger();
    routeApp(app); 
}