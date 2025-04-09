import express from "express"
import multer from "multer"
import {loginandsignup,verify,detail} from "../Controllers/Teacher.js"
import {verifytoken} from "../middleware/teacher.js"

const routes=express.Router()


const storage = multer.memoryStorage();
const upload = multer({ storage });

routes.post("/login",loginandsignup)
routes.post("/verify",verify)
routes.post("/details",verifytoken,upload.single("file"),detail)

export default routes
