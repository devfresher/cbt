import _ from 'lodash'
import jwt from 'jsonwebtoken'
import config from 'config'
import { User } from '../models/user.js'

export const requireLoggedInUser =  async function (req, res, next) {
    const token = req.header('x-auth-token')
    if( !token ) return res.status(401).send("Access denied. No auth token provided")

    try {
        const decodedToken = jwt.verify(token, config.get('jwtPrivateKey'))

        const user = User.findById(decodedToken._id)
        if (!user) return res.status(400).send("Invalid auth token")

        req.user = decodedToken
        next()
    } catch (error) {
        return res.status(400).send('Failed to authenticate token')
    }
}

export const requireRole  =  (roles) => {
    return (req, res, next) => {
        requireLoggedInUser(req, res, function() {
            roles = Array.isArray(roles) ? roles:[roles]
            if(!_.find(roles, (r) => r === req.user.role)) return res.status(403).send("Token valid, but forbidden to perform this action")
            next()
        })
    }
}