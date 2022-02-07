const mongoose = require("mongoose");
const otpSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
        },
        otp:{
            type: Number,
            required:true
        },
        expire_at: {
            type: Date, 
            default: Date.now, 
            expires:60
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema, "Otp");