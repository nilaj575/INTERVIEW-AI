const usermodel= require("../models/user.model");
const blacklistTokenModel=require("../models/blacklist.model");

const bcrypt=require("bcryptjs");

const jwt=require("jsonwebtoken");
const cookie=require("cookie-parser");
/**
 * 
 * @name registerUserController
 * @description register a new user, with name,email,password
 * @access Public
 */

async function registerUser(req,res) {
    const {username,email,password}=req.body;

    if(!username || !email || !password){
        return res.status(400).json({
            message:"please provide username email password"
        })
    }

    const exsistUser=await usermodel.findOne({email});

    if(exsistUser){
        return res.status(400).json({
            message:"user already exsist"
        })
    }

    const hash=await bcrypt.hash(password,10)

    const user=await usermodel.create({
        username,
        email,
        password:hash
    })

    const token=jwt.sign({
        id:user._id,
        username
    },
    process.env.JWT_SECRET,
    {
        expiresIn:"1d"
    }
)
res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000
});

res.status(201).json({
    message:"User registered successfully"
})

}

async function userLogin(req,res){


    const {email,password}=req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    const validUser = await usermodel.findOne({email});

    if(!validUser){
        return res.status(401).json({
            message:"Register first"
        })
    }

    const isPasswordValid= await bcrypt.compare(password, validUser.password);
    if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalid email or password"
        })
    }
    const token=jwt.sign({id:validUser._id, username: validUser.username},
        process.env.JWT_SECRET,
    {
        expiresIn:"1d"
    }
    )
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
    });
    res.status(200).json({
        message:"User login succesfully.",
        user:{
            id: validUser._id,
            username: validUser.username,
            email: validUser.email
        }
    })
}


async function logout(req,res) {
    const token = req.cookies.token;

    if(token){
        await blacklistTokenModel.create({token})
    }
    res.clearCookie("token")

    res.status(200).json({
        message:"User logged out successfully"
    })
}



async function getMeController(req,res){
    const user = await usermodel.findById(req.user.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.status(200).json({
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

module.exports={registerUser,userLogin,logout,getMeController}