import bodyParser from 'body-parser'
import cors from 'cors'

import authRouter from '../routes/auth.js'
import classRouter from '../routes/class.js'
import userRouter from '../routes/user.js'
import subjectRouter from '../routes/subject.js'

import errorMiddleware from '../middleware/error.js'


export const route = function (app) {
    app.use(bodyParser.json())
    app.use(cors());

    app.use('/api/auth/', authRouter)
    app.use('/api/class/', classRouter)
    app.use('/api/user/', userRouter)
    app.use('/api/subject/', subjectRouter)
    app.use(errorMiddleware)
}