import { useContext } from "react";
import { IMessage } from "../types/chat";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { RoomContext } from "../../context/RoomContext";

export const Chat: React.FC = ({}) => {

    const { chat } = useContext(RoomContext);

    return (
        
        <div className="bg-gradient-to-r from-[#000000] from-0% to-[#12085b] to-100% flex flex-col h-full justify-between">
            <div>
                {chat.messages.map((message: IMessage) => (
                    <ChatBubble message={message}/>
                ))}
            </div>
            <ChatInput/>
        </div>
    );
};