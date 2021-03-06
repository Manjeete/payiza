const mongoose = require("mongoose")
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
    },
    username:{
        type:String
    },
    password:{
        type:String,
        select:false
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

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,12);
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
};

module.exports = mongoose.model("User", userSchema, "User");