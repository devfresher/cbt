import winston from 'winston';

export default function (err, req, res, next) {
    winston.error(err.message, err);
    res.status(500).json("Something went wrong")
}