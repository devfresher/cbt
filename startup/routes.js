import bodyParser from "body-parser"
import cors from "cors"
import helmet from "helmet"

import authRouter from "../routes/auth.js"
import classRouter from "../routes/class.js"
import userRouter from "../routes/user.js"
import subjectRouter from "../routes/subject.js"
import assessmentRouter from "../routes/assessment.js"
import questionRouter from "../routes/question.js"
import resultRouter from "../routes/result.js"
import dashboardRouter from "../routes/dashboard.js"
import responseMiddleWare from "../middleware/response.js"

const routeApp = function (app) {
	app.use(bodyParser.json())
	app.use(cors())
	app.use(helmet())

	app.use("/api/auth/", authRouter)
	app.use("/api/class/", classRouter)
	app.use("/api/user/", userRouter)
	app.use("/api/subject/", subjectRouter)
	app.use("/api/assessment/", assessmentRouter)
	app.use("/api/question/", questionRouter)
	app.use("/api/result/", resultRouter)
	app.use("/api/dashboard/", dashboardRouter)
	app.use(responseMiddleWare)
}

export default routeApp
