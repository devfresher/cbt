import express from 'express'
import config from 'config'
import mongoose from 'mongoose'
import winston from 'winston'
import { host, port } from './config.js'

export default async (app) => {
    try {
        await mongoose.connect(config.get('dbConfig.url'))
        winston.info("Connected to DB")

        app.listen(port, host, () => {
            winston.info(`Server started at http://${host}:${port}`)
        })
    } catch (error) {
        winston.error(error)
    }
}