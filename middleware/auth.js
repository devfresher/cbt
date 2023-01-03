import _ from 'lodash'
import jwt from 'jsonwebtoken'
import config from 'config'
import User, * as userModel from '../models/user.js'

export const requireLoggedInUser =  async function (req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.replace(/^Bearer\s+/, "")

    if( !token ) return res.status(401).json("Access denied. No auth token provided")

    try {
        const decodedToken = jwt.verify(token, config.get('jwtPrivateKey'))

        const user = User.findById(decodedToken._id)
        if (!user) return res.status(400).json("Invalid auth token")

        req.user = decodedToken
        next()
    } catch (err) {
        if (err.name === "TokenExpiredError") return res.status(400).json('Auth token expired')

        res.status(400).json('Failed to authenticate token')
    }
}

export const requireRole  =  (roles) => {
    return (req, res, next) => {
        requireLoggedInUser(req, res, function() {
            roles = Array.isArray(roles) ? roles:[roles]
            if(!_.find(roles, (r) => r === req.user.role)) return res.status(403).json("Token valid, but forbidden to perform this action")
            next()
        })
    }
}