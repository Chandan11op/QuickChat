import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

senderId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

receiverId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

  text: {
    type: String
  },
  fileUrl: {
    type: String
  },
  fileType: {
    type: String,
    enum: ["image", "video", "file", "text"],
    default: "text"
  }

},
{timestamps:true}
)

export default mongoose.model("Message",messageSchema);