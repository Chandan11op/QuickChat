export default function MessageInput(){

return(

<div className="p-4 border-t border-gray-800 flex gap-2">

<input
className="flex-1 bg-gray-800 rounded-lg p-2"
placeholder="Type a message..."
/>

<button className="bg-blue-600 px-4 rounded">
Send
</button>

</div>

)

}