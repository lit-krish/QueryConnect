import express from "express"
import {registerandlogin,verifyotp,completeyourprofile} from "./controler.js"
import { verifytoken } from "./middleware.js"

const routes=express.Router()

routes.post("/login",registerandlogin)
routes.post("/verification",verifyotp)
routes.post("/complete-your-profile",verifytoken,completeyourprofile)

export default routes