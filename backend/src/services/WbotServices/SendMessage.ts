import { proto } from "@whiskeysockets/baileys";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

interface Request {
  message: Message;
  tenantId: string | number;
}

const SendMessage = async ({ 
  message, 
  tenantId 
}: Request): Promise<proto.WebMessageInfo | null> => {
  const ticket = await Ticket.findByPk(message.ticketId, {
    include: ["contact", "whatsapp"]
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  const wbot = await GetTicketWbot(ticket);
  const chatId = `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;

  let sendedMessage: proto.WebMessageInfo | undefined;

  if (message.quotedMsgId) {
    const quotedMessage = await Message.findOne({
      where: { messageId: message.quotedMsgId }
    });

    if (quotedMessage) {
      sendedMessage = await wbot.sendMessage(
        chatId,
        { text: message.body },
        {
          quoted: {
            key: {
              id: quotedMessage.messageId,
              fromMe: quotedMessage.fromMe,
              remoteJid: chatId
            },
            message: {
              conversation: quotedMessage.body
            }
          }
        }
      );
    } else {
      sendedMessage = await wbot.sendMessage(chatId, { text: message.body });
    }
  } else {
    sendedMessage = await wbot.sendMessage(chatId, { text: message.body });
  }

  return sendedMessage || null;
};

export default SendMessage;
