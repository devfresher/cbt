import config from 'config'
import mongoose from 'mongoose'
import winston from 'winston'

const { name, host, port } =  config.get('app')

export default async (app) => {
    try {
        console.log(config.get('db.url'));
        await mongoose.connect(config.get('db.url'))
        winston.info(`${name} is connected to DB`)

        app.listen(port, host, () => {
            winston.info(`${name}'s Server started at http://${host}:${port}`)
        })
    } catch (error) {
        winston.error(error)
    }
}