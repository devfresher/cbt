import config from 'config'
import mongoose from 'mongoose'
import winston from 'winston'

export default async () => {
    try {
        console.log(config.get('dbConfig.url'));
        await mongoose.connect(config.get('dbConfig.url'))
        winston.info("Connected to DB")
    } catch (error) {
        winston.error(error)
    }
}