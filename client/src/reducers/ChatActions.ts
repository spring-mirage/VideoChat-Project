import { IMessage } from "../components/types/chat";

export const ADD_MESSAGE = "ADD_MESSAGE" as const;
export const ADD_HISTORY = "ADD_HISTORY" as const;

export const addMessageAction = (message: IMessage) => ({
  type: ADD_MESSAGE,
  payload: { message },
});

export const addHistoryAction = (history: IMessage[]) => ({
    type: ADD_HISTORY,
    payload: { history },
});