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

const hashedPassword = await bcrypt.hash(password,10)

const user = await User.create({
username,
email,
password:hashedPassword
})

res.json(user)

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

const match = await bcrypt.compare(password,user.password)

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