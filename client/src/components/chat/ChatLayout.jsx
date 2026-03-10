import MessageBubble from "./MessageBubble"
import MessageInput from "./MessageInput"
import ChatProfilePanel from "./ChatProfilePanel"

export default function ChatLayout(){

return(

<div className="flex flex-1">

<div className="flex flex-col flex-1">

<div className="p-4 border-b border-gray-800">
Jordan Smith
</div>

<div className="flex-1 p-6 space-y-4 overflow-y-auto">

<MessageBubble own={false} text="Hello!" />
<MessageBubble own text="Hi there!" />

</div>

<MessageInput/>

</div>

<ChatProfilePanel/>

</div>

)

}