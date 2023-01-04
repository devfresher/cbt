import express from 'express'
import winston from 'winston'
import bootstrap from './bootstrap.js'

const app = express()

bootstrap(app)
export default app