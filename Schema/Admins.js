const mongoose = require('mongoose')
const adminSchema = new mongoose.Schema({
    name:{
        type:String,
        default:""
    },
    password:{
        type:String,
        required:[true,"Please enter a password"],
    },
    email:{
        type:String,
        required:[true,"Please enter an email"],
        default:""
    },
    activatedByAdmin:{
        type:Boolean,
        default:true
    },
    type_of_user:{
        type:String,
        default:""
    },
})

module.exports = mongoose.model("admins",adminSchema)