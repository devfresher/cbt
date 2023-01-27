import express from "express"

const router = express.Router()

import * as authController from '../controllers/authController.js'
import * as userController from '../controllers/userController.js'
import { uploadSingleImage } from "../middleware/uploadFiles.js"


router.post("/login", authController.login)
router.post("/student/login", authController.studentLogin)
router.post("/register", uploadSingleImage('profileImage'), userController.createUser)

export default router