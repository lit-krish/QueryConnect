import nodemailer from "nodemailer"
import dotenv from "dotenv"
import { google } from "googleapis"
import Teacher from "../Models/Teacher.js"
import jwt from "jsonwebtoken"
import {MailtrapTransport} from "mailtrap"

dotenv.config()

const OAuth2 = google.auth.OAuth2

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
)

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

const accessToken = await oauth2Client.getAccessToken()

const transporter = nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MailTrap,

  })
);

export const loginandsignup = async (req, res) => {
  const { email } = req.body
  const otp = Math.floor(Math.random() * 9000 + 1000)
  const otpExpiry = Date.now() + 180000 //3 minutes time before expiry

  try {
    let existing = await Teacher.findOne({ email })
    if (existing) {
      existing.otp = otp
      existing.otpExpiry = otpExpiry
      await existing.save();
      console.log("otp sent-" + existing.otp)
    }

    else {
      const register = new Teacher({ email: email, otp: otp, otpExpiry: otpExpiry })
      await register.save()
      console.log(register.email, register.otp)
    }

    try {
      const info = await transporter.sendMail({
        from: `QueryConnect <${process.env.email}>`,
        to: email,
        subject: "Verify Your Email-QueryConnect",
        html: `<p>Hello,</p>
        <p>Here is your One-Time Password (OTP): <strong>${otp}</strong></p>
        <p>This OTP will expire in 3 minute.</p>
        <p>Best Regards,<br><strong>QueryConnect Team</strong></p>`,
      })
      console.log("otp sent", info.messageId)
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

export const verify = async (req, res) => {
  const { email, otp } = req.body

  try {
    const teacherinfo = await Teacher.findOne({ email })

    if (!teacherinfo) {
      console.log("User info not saved")
      return res.status(400).json("User not registered.Try again")
    }
    else {
      if (otp != teacherinfo.otp || teacherinfo.otpExpiry < Date.now()) {
        return res.status(400).json("invalid otp try again ")
      }
      teacherinfo.otp = null
      teacherinfo.otpExpiry = null
      await teacherinfo.save()
      
      const token = jwt.sign({ id: teacherinfo._id, email: email }, process.env.JWT_SECRET, { expiresIn: "1h" })

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 3600000,
      });
      return res.status(200).json(teacherinfo)
    }
  }
  catch (err) {
    console.log(err)
  }
}

export const detail = async (req, res) => {
  const { email, firstname, lastname, gender, availablity, qualifcation, qualifcationstatus, experience, expert, occupation } = req.body

  try {
    let someone = await Teacher.findOne({ email })

    //console.log(req.file.buffer)//returning undefined

    if (!someone) {
      return res.status(404).json("user not found")
    }
    someone.firstname = firstname
    someone.lastname = lastname
    someone.gender = gender
    someone.availablity = availablity
    someone.qualification = qualifcation
    someone.qualistatus = qualifcationstatus
    someone.experience = experience
    someone.expert = expert
    someone.occupation = occupation
    someone.doc = req.file.buffer
    someone.docname = req.file.originalname + "-" + Date.now()
    
    console.log(req.file.originalname)

    await someone.save();
    
    console.log("file saved")
    
    return res.status(200).json({
      First_name: firstname,
      Last_name: lastname,
      Gender: gender,
      Available: availablity,
      Quali: qualifcation,
      Status: qualifcationstatus,
      Exp: experience,
      Expert: expert,
      Occupation: occupation,
      file_uploaded: req.file.originalname

    })
  }
  catch (err) {
    console.log(err)
  }
}
