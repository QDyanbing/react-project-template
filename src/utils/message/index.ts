export type MessageType = "warning" | "error";

type MessageHandler = ((type: MessageType, content: string) => void) | null;

let messageHandler: MessageHandler = null;

export function setMessageHandler(handler: MessageHandler) {
  messageHandler = handler;
}

export function emitMessage(type: MessageType, content: string) {
  messageHandler?.(type, content);
}
