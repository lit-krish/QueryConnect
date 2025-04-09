import jwt from "jsonwebtoken"
import config from "../config.js"

export const verifytoken=(req,res,next)=>{

    const token=req?.cookie?.token
    console.log(token)
    if(!token)
        return res.status(404).json("Access Denied")
    
    try{
       const data=jwt.verify(token,config.JWT_SECRET)
       req.user=data
       next()
    }
    catch(err)
    {
        console.log(err.message)
    }
}