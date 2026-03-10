import { useState } from "react"

export default function AvatarUpload(){

const [preview,setPreview]=useState(null)

const handleImage=(e)=>{
const file=e.target.files[0]
setPreview(URL.createObjectURL(file))
}

return(

<div className="flex flex-col items-center gap-3">

<img
src={preview || "https://i.pravatar.cc/150"}
className="w-28 h-28 rounded-full"
/>

<input type="file" onChange={handleImage}/>

</div>

)

}