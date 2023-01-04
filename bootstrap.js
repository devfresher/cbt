import * as asyncErrors from 'express-async-errors'
import logger from './startup/logger.js';
import routeApp from './startup/routes.js';
import serve from './startup/db.js';

export default (app) => {
    logger();
    routeApp(app); 
    serve(app)
}