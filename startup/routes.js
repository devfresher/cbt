import bodyParser from 'body-parser'
import cors from 'cors'

import authRouter from '../routes/auth.js'

import errorMiddleware from '../middleware/error.js'


export const route = function (app) {
    app.use(bodyParser.json())
    app.use(cors());

    app.use('/api/auth/', authRouter)
    app.use(errorMiddleware)
}