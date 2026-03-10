export default function ChatProfilePanel(){

return(

<div className="w-80 border-l border-gray-800 p-6">

<div className="flex flex-col items-center gap-3">

<img
src="https://i.pravatar.cc/100"
className="w-24 h-24 rounded-full"
/>

<h3 className="text-lg font-semibold">
Jordan Smith
</h3>

<p className="text-gray-400 text-sm">
Product Designer
</p>

</div>

<div className="mt-8 space-y-3">

<button className="w-full bg-gray-800 p-2 rounded">
Search Messages
</button>

<button className="w-full bg-gray-800 p-2 rounded">
Media Files
</button>

<button className="w-full bg-red-600 p-2 rounded">
Block User
</button>

</div>

</div>

)

}