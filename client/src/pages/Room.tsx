import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom"
import { RoomContext } from "../context/RoomContext";
import { VideoPlayer } from "../components/VideoPlayer";
import { PeerState } from "../reducers/PeerReducer";
import { ShareScreenButton } from "../components/ShareScreenButton";
import { ChatButton } from "../components/ChatButton";
import { Chat } from "../components/chat/Chat";
import { NameInput } from "../common/Name";

export const Room = () => {

  const { id } = useParams();
  const { 
    ws, 
    me, 
    stream, 
    peers, 
    shareScreen, 
    screenSharingId, 
    setRoomId, 
    toggleChat,
    chat,
    userName
  } = useContext(RoomContext)

  useEffect(() => {
    if(me) ws.emit("join-room", {roomId: id, peerId: me._id, userName})
  }, [id, me, ws, userName])

  useEffect(() => {
    setRoomId(id)
  }, [id, setRoomId])

  const screenSharingVideo = screenSharingId === me?.id ? stream : peers[screenSharingId]?.stream;

  const { [screenSharingId]: sharing, ...peersToShow } = peers;
  
  console.log({screenSharingId});
  
  return (
    <div className="bg-gradient-to-r from-[#000000] from-0% to-[#383838] to-100% flex flex-col min-h-screen">
      <div className="bg-red-500 p-4 text-white">
        Room: {id}
      </div>
      <div className="flex grow">
        {screenSharingId && (
          <div className="w-4/5 pr-4">
            <VideoPlayer stream={screenSharingVideo}/>
          </div>
        )}
        <div 
          className={`grid gap-4 ${
            screenSharingVideo ? "w-1/5 grid-cols-1" : "grid-cols-4"
          }`}
        >
          {
            screenSharingId !== me?.id && (
              <div>
                <VideoPlayer stream={stream}/>
                <NameInput />
              </div>
            )
          }

          { 
            Object.values(peersToShow as PeerState).map((peer) => (
              <div>
                <VideoPlayer  stream={peer.stream} /> 
                <div className="text-white">{ peer.userName }</div>
              </div>
            )
          )}
        </div>
        {chat.isChatOpen && (
          <div className="border-l-2 pb-28">
            <Chat />
          </div>
        )}
      </div>
      <div className="bg-black text-white h-28 fixed bottom-0 p-6 w-full items-center flex justify-center border-t-2">
        <ShareScreenButton onClick={shareScreen}/>
        <ChatButton onClick={toggleChat}/>
      </div>
    </div>
  )
}