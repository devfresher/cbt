import express from "express"

const router = express.Router()

import { getAll, createClass } from '../controllers/classController.js'
import { requireRole } from "../middleware/auth.js"

router.get("/", requireRole (['Admin', 'Staff']), getAll)
router.post("/", requireRole (['Admin']), createClass)
export default router