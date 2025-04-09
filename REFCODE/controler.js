import nodemailer from "nodemailer"
import config from "../config.js"
import User from "../Models/User.js"
import { google } from "googleapis"
import jwt from "jsonwebtoken"

const oAuth2=google.auth.OAuth2

const oauth2Client=new oAuth2(
    config.CLIENT_ID,
    config.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
)
//console.log(config.CLIENT_ID)
//console.log(config.CLIENT_SECRET)
//console.log(config.REFRESH_TOKEN)

oauth2Client.setCredentials({refresh_token:config.REFRESH_TOKEN})

const accessToken=await oauth2Client.getAccessToken();

const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        type:"OAuth2",
        user:config.email,
        clientId:config.CLIENT_ID,
        clientSecret:config.CLIENT_SECRET,
        refreshToken:config.REFRESH_TOKEN,
        accessToken:accessToken.token
    }
})

export const registerandlogin = async (req, res) => {
    //console.log("working")
    const {email} = req.body
    const otp = Math.floor(1000+Math.random() * 9000).toString()
    const otpExpiry = Date.now() + 120000 //otp valid for 2 min i.e 120 sec and 120000milliseconds
    console.log(otp)

    try {
        let existinguser = await User.findOne({email})
        if (!existinguser) {
            const newUser = new User({ email: email, otp: otp, otpExpiry: otpExpiry })
            await newUser.save();
        }
        else {
            existinguser.otp = otp
            existinguser.otpExpiry = otpExpiry
            await existinguser.save();
        }
        //    console.log(email,otp)
    
        try {
            const info = await transporter.sendMail({
                from: QueryConnect ,
                to: email,
                subject: "Verify Your Email-QueryConnect",
                html: `<p>Hello,</p>
                <p>Here is your One-Time Password (OTP): <strong>${otp}</strong></p>
                <p>This OTP will expire in 2 minute.</p>
                <p>Best Regards,<br><strong>QueryConnect Team</strong></p>`,
            })
            //console.log(info)
            console.log("Message sent", info.messageId);
            return res.status(200).json("Otp sent successfully")
        }
        catch (err) {
            console.log(err)
            return res.status(500).json("Unable to send otp")
        }
    }
    catch (error) {
        console.log(error)
    }
}

export const verifyotp = async (req, res) => {
    const { email, otp } = req.body;
    console.log(email,otp)
    try {
        let userinfo = (await User.findOne({email}))
        console.log(userinfo)
        if (!userinfo) {
            console.log("User info not saved")
            return res.status(400).json("User not registered.Try again")
        }
        else {
            if (userinfo.otp !== otp || userinfo.otpExpiry < Date.now())
                return res.status(400).json({ error: "Invalid otp.Try again" })

            userinfo.otp = null
            userinfo.otpExpiry = null
            userinfo.freeaccess=0
            await userinfo.save()

            const token=jwt.sign({id:userinfo._id,email:email},config.JWT_SECRET,{expiresIn:"1h"})
            console.log(token)
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 3600000,
              });
            return res.status(200).json(userinfo)
        }
    }
    catch (error) {
        console.log(error)
    }
}

export const completeyourprofile=async(req,res)=>{
    const {email,firstname,lastname,gender,currentclass}=req.body
    try{
       const userinfo=await User.findOne({email})

       if(!userinfo)
        return res.json("User does not exist").status(404)

       userinfo.firstname=firstname
       userinfo.lastname=lastname
       userinfo.gender=gender
       userinfo.currentclass=currentclass

       await userinfo.save()
       return res.status(200).json({data:userinfo,message:"Profile completed"})
    }
    catch(err)
    {
        console.log(err.message)
    }
}