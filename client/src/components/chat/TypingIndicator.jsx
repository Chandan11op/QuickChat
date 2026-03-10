export default function TypingIndicator(){

return(

<div className="flex items-center gap-2 text-gray-400 text-sm">

<div className="flex gap-1">

<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"/>
<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"/>
<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"/>

</div>

<span>User is typing...</span>

</div>

)

}