import { useContext } from "react"
import { RoomContext } from "../context/RoomContext"
import { NameInput } from "../common/Name";

export const Join: React.FC = () => {
  const { ws } = useContext(RoomContext);
  const createRoom = () => {
    ws.emit('create-room');
  }

  return (
    <div className="flex flex-col">
      <NameInput />
      <button onClick={createRoom} className='bg-emerald-500 py-2 px-8 rounded-lg text-xl text-white hover:bg-emerald-600 hover:text-white font-semibold'>
        Start new Meeting
      </button>
    </div>
  );
};