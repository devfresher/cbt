import jwt from 'jsonwebtoken';
import config from 'config';
import User from '../models/user.js';

const requireLoggedInUser = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.replace(/^Bearer\s+/, '');
        if (!token) {
            return next({
                status: 'error',
                code: 401,
                message: 'Access denied. No auth token provided'
            });
        }

        const decodedToken = jwt.verify(token, config.get('jwtPrivateKey'));
        const user = await User.findById(decodedToken._id);
        if (!user) {
            return next({
                status: 'error',
                code: 400,
                message: 'Invalid auth token'
            });
        }

        req.user = decodedToken;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next({
                status: 'error',
                code: 400,
                message: 'Auth token expired'
            });
        }

        return next({
            status: 'error',
            code: 401,
            message: 'Failed to authenticate token'
        });
    }
};

const requireRole = roles => {
    return async (req, res, next) => {
        await requireLoggedInUser(req, res, error => {
            if (error) return next(error);

            roles = Array.isArray(roles) ? roles : [roles];
            if (!roles.includes(req.user.role)) {
                return next({
                    status: 'error',
                    code: 403,
                    message: 'Token valid, but forbidden to take this action'
                });
            }

            next();
        });
    };
};

export { requireLoggedInUser, requireRole };