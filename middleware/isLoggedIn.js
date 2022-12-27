import jwt from 'jsonwebtoken'
import config from 'config'
import { db } from '../startup/db.js'

export default async function (req, res, next) {
    const token = req.header('x-auth-token')
    if( !token ) return res.status(401).send("Access denied. No auth token provided")

    try {
        const decodedToken = jwt.verify(token, config.get('jwtPrivateKey'))

        await db.read()
        const user = db.data.users.find((u) => u._id === decodedToken._id)
        if (!user) return res.status(400).send("Invalid auth token")

        req.user = decodedToken
        next()
    } catch (error) {
        return res.status(400).send('Invalid auth token')
    }
}