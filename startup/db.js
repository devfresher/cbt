import config from 'config'
import mongoose from 'mongoose'
import winston from 'winston'

export default function () {
    mongoose.connect(config.get('dbConfig.url'))
        .then(() => { winston.info("Connected to DB"); })
}