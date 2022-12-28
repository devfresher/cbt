import express from "express"

const router = express.Router()

import { login } from '../controllers/authController.js'
import { createUser } from '../controllers/userController.js'

router.post("/login", login)
router.post("/register", createUser)

export default router