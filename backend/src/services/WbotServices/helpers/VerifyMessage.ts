import { proto } from "@whiskeysockets/baileys";
import Contact from "../../../models/Contact";
import Ticket from "../../../models/Ticket";
import CreateMessageService from "../../MessageServices/CreateMessageService";
import VerifyQuotedMessage from "./VerifyQuotedMessage";

const prepareLocation = (msg: proto.IWebMessageInfo): proto.IWebMessageInfo => {
  const location = msg.message?.locationMessage;
  if (location) {
    const gmapsUrl = `https://maps.google.com/maps?q=${location.degreesLatitude}%2C${location.degreesLongitude}&z=17`;
    // Crear una nueva estructura de mensaje con el texto de ubicación
    const newMsg = {
      ...msg,
      message: {
        ...msg.message,
        conversation: gmapsUrl
      }
    };
    return newMsg;
  }
  return msg;
};

const VerifyMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
) => {
  if (msg.message?.locationMessage) msg = prepareLocation(msg);

  const quotedMsg = await VerifyQuotedMessage(msg);

  const messageData = {
    messageId: msg.key.id || "",
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body: msg.message?.conversation || msg.message?.extendedTextMessage?.text || "",
    fromMe: msg.key.fromMe || false,
    mediaType: msg.message?.locationMessage ? "location" : "chat",
    read: msg.key.fromMe || false,
    quotedMsgId: quotedMsg?.id,
    timestamp: (msg.messageTimestamp as number) * 1000,
    status: "received"
  };
  
  await ticket.update({
    lastMessage:
      msg.message?.locationMessage
        ? "Localização"
        : messageData.body
  });

  await ticket.update({
    lastMessage: messageData.body,
    lastMessageAt: new Date().getTime(),
    answered: msg.key.fromMe || false
  });
  await CreateMessageService({ messageData, tenantId: ticket.tenantId });
};

export default VerifyMessage;
