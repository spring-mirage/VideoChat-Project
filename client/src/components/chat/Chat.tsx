import { useContext } from "react";
import { IMessage } from "../types/chat";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { RoomContext } from "../../context/RoomContext";

export const Chat: React.FC = ({}) => {

    const { chat } = useContext(RoomContext);
    
    const messages: IMessage[] = [
        {
            content: "Message 1",
            author: "",
            timestamp: 0,
        },
        {
            content: "Message 2",
            author: "",
            timestamp: 0,
        }
    ];

    return (
        
        <div className="flex flex-col h-full justify-between">
            <div>
                {chat.messages.map((message: IMessage) => (
                    <ChatBubble message={message}/>
                ))}
            </div>
            <ChatInput/>
        </div>
    );
};