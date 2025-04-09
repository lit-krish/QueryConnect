import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const verifytoken=(req,res,next)=>{

    const token=req?.cookies?.token
   // console.log(req.cookie)

    if(!token)
        return res.status(404).json("Access Denied")
    
    try{
       const data=jwt.verify(token,process.env.JWT_SECRET)
       req.user=data
       next()
    }
    catch(err)
    {
        console.log(err.message)
    }
}