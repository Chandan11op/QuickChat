export default function SearchUsersModal({open,onClose}){

if(!open) return null

return(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<div className="bg-gray-900 w-96 rounded-xl p-6">

<div className="flex justify-between mb-4">

<h2 className="text-lg font-semibold">
Search Users
</h2>

<button onClick={onClose}>✕</button>

</div>

<input
placeholder="Search username..."
className="w-full bg-gray-800 rounded-lg p-2"
/>

<div className="mt-4 space-y-3">

<div className="flex items-center justify-between">

<div className="flex items-center gap-2">

<img
src="https://i.pravatar.cc/40"
className="rounded-full"
/>

<span>Alex Rivers</span>

</div>

<button className="bg-green-500 px-3 py-1 rounded">
Add Friend
</button>

</div>

</div>

</div>

</div>

)

}