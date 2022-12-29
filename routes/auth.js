import express from "express"

const router = express.Router()

import * as authController from '../controllers/authController.js'
import * as userController from '../controllers/userController.js'

router.post("/login", authController.login)
router.post("/student/login", authController.studentLogin)
router.post("/register", userController.createUser)

export default router