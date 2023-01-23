import _ from 'lodash'
import jwt from 'jsonwebtoken'
import config from 'config'
import User from '../models/user.js'

export const requireLoggedInUser =  async function (req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.replace(/^Bearer\s+/, "")

    if( !token ) throw{status: "error", code: 401, message: "Access denied. No auth token provided"}

    try {
        const decodedToken = jwt.verify(token, config.get('jwtPrivateKey'))

        const user = User.findById(decodedToken._id)
        if (!user) throw {status: "error", code: 400, message: "Invalid auth token"}

        req.user = decodedToken
        next()
    } catch (err) {
        if (err.name === "TokenExpiredError") return res.status(400).json({status: "error", error: {code: 400, message: "Auth token expired"}})
        res.status(401).json({status: "error", error: {code: 401, message: "Failed to authenticate token"}})
    }
}

export const requireRole  =  (roles) => {
    return (req, res, next) => {
        requireLoggedInUser(req, res, function() {
            roles = Array.isArray(roles) ? roles:[roles]
            if(!_.find(roles, (r) => r === req.user.role)) res.status(403).json({status: "error", error: {code: 403, message: "Token valid, but forbidden to take this action"}})
            next()
        })
    }
}