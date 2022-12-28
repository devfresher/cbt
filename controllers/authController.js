import _ from 'lodash'
import bcrypt from 'bcrypt'
import { User, validateLogin } from '../models/user.js'

export const login = async function (req, res) {
    let { error } = validateLogin(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    let user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send("Invalid email or password")

    const isValidPassword = await bcrypt.compare(req.body.password, user.password)
    if (!isValidPassword) return res.status(400).send("Invalid email or password")

    const token = user.generateAuthToken()
    res.json(token)
}