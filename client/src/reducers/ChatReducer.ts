import { IMessage } from "../components/types/chat";
import { ADD_HISTORY, ADD_MESSAGE } from "./ChatActions";

export type ChatState = {
    messages: IMessage[];
}

type ChatAction =
    |   {
            type: typeof ADD_MESSAGE;
            payload: { message: IMessage };
        }
    |   {
            type: typeof ADD_HISTORY;
            payload: { history: IMessage[] };
        };

    export const chatReducer = (state: ChatState, action: ChatAction) => {
        switch (action.type) {
            case ADD_MESSAGE:
                return {
                    ...state,
                    messages: [...state.messages, action.payload.message]
                };
            case ADD_HISTORY:
                return {
                    ...state,
                    messages: action.payload.history
                };
            default:
                return state;
        }
    }
