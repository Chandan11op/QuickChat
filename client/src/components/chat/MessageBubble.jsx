export default function MessageBubble({text,own}){

return(

<div className={`flex ${own?"justify-end":"justify-start"}`}>

<div className={`px-4 py-2 rounded-xl max-w-xs
${own?"bg-blue-600":"bg-gray-700"}`}>

{text}

</div>

</div>

)

}