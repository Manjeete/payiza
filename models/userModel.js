const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
    },
    username:{
        type:String
    },
    password:{
        type:String
    },
    phone:{
        type:String
    },
    userType: {
        type: String,
        enum: ["user", "admin", "superAdmin"],
        default: "user",
    },
},
    { timestamps: true }
)

module.exports = mongoose.model("User", userSchema, "User");