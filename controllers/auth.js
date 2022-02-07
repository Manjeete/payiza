const sendotp = require("../utils/sendOtp");
const jwt = require("jsonwebtoken")
const {promisify} = require('util');
require('dotenv').config()

//models 
const Otp = require("../models/otpModel");
const User = require("../models/userModel");

//send otp to user
exports.sendOtp = async(req,res) =>{
    try{
        const {phone} = req.body;
        let otp = await sendotp(phone)
        if(!otp.status){
            return res.status(400).json({
                status:false,
                msg:otp.msg
            })
        }
        let checkOtp = await Otp.findOneAndDelete({phone:phone});
        let createOtp = await Otp.create({phone:phone,otp:otp.otp});
        
        //we can avoid otp in response (This is only for testing)
        res.status(200).json(otp)
    }catch(err){
        console.log(err)
    }
}

// userType=== user create (and login with otp)
//verify otp
exports.verifyOtp = async(req,res) =>{
    try{
        const {phone,otp} = req.body;

        let checkOtp = await Otp.findOne({phone:phone,otp:otp});
        if(!checkOtp){
            return res.status(400).json({
                status:false,
                msg:"Invalid Otp"
            })
        }
        let user = await User.findOne({phone:phone});
        if(!user){
            user = await User.create({phone:phone});
        }
        let deleteOtp = await Otp.findOneAndDelete({phone:phone});
        const token = jwt.sign(user.toJSON(),process.env.JWT_SECRET)
        res.status(200).json({
            status:true,
            token,
            user
        })

    }catch(err){
        console.log(err)
    }
}


//admin ans SuperAdmin signup
// user signup
exports.signup =async(req,res,next) =>{
    try{
        const {username,password,userType} = req.body;
        if(!userType || userType==='user'){
            return res.status(400).json({
                status:false,
                msg:"Pass only admin or superAdmin"
            })
        }
        if(!username){
            return res.status(400).json({
                status:false,
                msg:"Please pass email field"
            })
        }
        if(username){
            let checkUsername = await User.findOne({username:username});
            if(checkUsername){
                res.status(400).json({
                    status:false,
                    msg:"User with this username already exists"
                })
            }
        }
        const newUser = await User.create({
            name:req.body.name,
            password:req.body.password,
            username:req.body.username,
            phone:req.body.phone,
            userType:req.body.userType
        });

        const token = jwt.sign(newUser.toJSON(),process.env.JWT_SECRET)
        res.status(200).json({
            status:true,
            token,
            user:newUser
        })


    }catch(err){
        return res.status(500).json({
            status:false,
            msg:err.message
        })
    }
    
};


//user login (with username and password)
exports.login = async (req,res,next) =>{
    try{
        const {username,password} = req.body;

        // 1) Check if email  and password 
        if(!username || !password){
            return res.status(400).json({
                status:false,
                msg:"Please provide both username and password"
            })
        }
        // 2) Check is user exists and password is correct
        const user = await User.findOne({username}).select('+password')
        if(!user || !(await user.correctPassword(password,user.password))){
            return res.status(400).json({
                status:false,
                msg:"username or password did not match"
            })
        }

        // 3) If everything ok,send token to client
        const token = jwt.sign(user.toJSON(),process.env.JWT_SECRET)
        res.status(200).json({
            status:true,
            token,
            user
        })

    }catch(err){
        return res.status(500).json({
            status:false,
            msg:err.message
        })
    }
};

// check whether token is valid or not
exports.isAuthenticated = async (req,res,next) =>{
    // 1) Getting token and check of it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return res.status(401).json({
            status:false,
            msg:'You are not logged in! Please log in to get access.'

        })
    }
    // 2) Token verification 
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded._id);
    if(!currentUser){
        return res.status(401).json({
            status:false,
            msg:'The user belonging to this token does no longer exists'
        })
    }
    req.user = currentUser;
    next();
};

//check whether user is admin or SuperAdmin
exports.isAdmin = async(req,res,next) =>{
    try{
        let user = req.user
        console.log(user.userType)
        if(user.userType != 'admin' && user.userType !=='superAdmin'){
            return res.status(401).json({
                status:false,
                msg:"Only admin and Super have access to this route."
            })
        }
        next();
    }catch(err){
        console.log(err)
    }
}

//route for all type of user
exports.test = (req,res) =>{
    res.status(200).json({
        status:true,
        msg:"All type of user can acces this route"
    })
}


//route only for admin and super admin
exports.testAdmin  = (req,res) =>{
    res.status(200).json({
        status:true,
        msg:"Route only for admin or superAdmin"
    })
}


//user update
exports.userUpdate = async(req,res) =>{
    try{
        const user = req.user
        const {name,phone} = req.body
        let userUpdate = await User.findByIdAndUpdate({_id:user._id},{name:name,phone:phone},{new:true})

        res.status(200).json({
            status:true,
            user:userUpdate
        })

    }catch(err){
        return res.status(500).json({
            status:false,
            msg:err.message
        })
    }
}