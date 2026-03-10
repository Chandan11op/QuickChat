export default function ConversationItem({name,message,time,active}){

return(

<div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer
${active?"bg-blue-600/20":"hover:bg-gray-800"}`}>

<img
src="https://i.pravatar.cc/40"
className="w-10 h-10 rounded-full"
/>

<div className="flex-1">

<p className="font-medium">{name}</p>

<p className="text-sm text-gray-400">
{message}
</p>

</div>

<span className="text-xs text-gray-500">
{time}
</span>

</div>

)

}