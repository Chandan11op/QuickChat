import ConversationItem from "./ConversationItem"

export default function ChatSidebar(){

return(

<div className="w-80 border-r border-gray-800 flex flex-col">

<div className="p-4 text-xl font-semibold">
QuickChat
</div>

<div className="p-3">

<input
placeholder="Search conversations..."
className="w-full bg-gray-800 rounded-lg p-2"
/>

</div>

<div className="flex-1 overflow-y-auto space-y-1 px-2">

<ConversationItem
name="Jordan Smith"
message="Checking the new design..."
time="Now"
active
/>

<ConversationItem
name="Sarah Chen"
message="Let's catch up later"
time="12:45"
/>

</div>

</div>

)

}