import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({

username:{
type:String,
required:true,
trim:true
},

email:{
type:String,
required:true,
unique:true,
trim:true
},

  password:{
    type:String,
    required: function() {
      return !this.googleId && !this.githubId;
    }
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true
  },

  githubId: {
    type: String,
    unique: true,
    sparse: true
  },

  avatar:{
    type:String,
    default:""
  },

bio:{
type:String,
default:""
},

friends:[
{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
}
],

  friendRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  blockedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]

},
{timestamps:true}
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User",userSchema);