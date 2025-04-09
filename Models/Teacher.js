import mongoose from "mongoose"

const TeacherSchema=new mongoose.Schema({
    email:{
        type:"String",
        required:"true"
    
    },
    otp:{type:"String"},
    otpExpiry:{type:"Date"},
    firstname:{type:"String"},
    lastname:{type:"String"},
    gender:{type:"String"},
    availablity:{type:"String"},//day when available generally
    qualification:{type:"String" },//degree
    qualistatus:{type:"String"},//ongoin or completed
    experience:{type:"String",default:"none",},//workes as teacher or none
    expert:{type:"String"},//known dubjects
    occupation:{type:"String",default:"none"},//current job
    doc:{type:"buffer"},
    docname:{type:"String"}
})

export default mongoose.model("Teacher",TeacherSchema)
