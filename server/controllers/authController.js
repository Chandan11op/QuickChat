import User from "../models/User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function register(req,res){

try{

const {username,email,password} = req.body

const userExists = await User.findOne({email})

if(userExists){
return res.status(400).json({msg:"User already exists"})
}

// Password will be hashed by User model pre-save hook
const user = await User.create({
username,
email,
password
})

const token = jwt.sign(
{id:user._id},
process.env.JWT_SECRET,
{expiresIn:"7d"}
)

res.json({token,user})

}catch(err){

res.status(500).json(err)

}

}

export async function login(req,res){

try{

const {email,password} = req.body

const user = await User.findOne({email})

if(!user){
return res.status(400).json({msg:"Invalid credentials"})
}

// Use schema method to compare passwords
const match = await user.comparePassword(password)

if(!match){
return res.status(400).json({msg:"Invalid credentials"})
}

const token = jwt.sign(
{id:user._id},
process.env.JWT_SECRET,
{expiresIn:"7d"}
)

res.json({token,user})

}catch(err){

res.status(500).json(err)

}

}

export async function oauthSuccess(req, res) {
  try {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userData = JSON.stringify({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
    });

    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/oauth-success?token=${token}&user=${encodeURIComponent(userData)}`);
  } catch (err) {
    res.status(500).json(err);
  }
}