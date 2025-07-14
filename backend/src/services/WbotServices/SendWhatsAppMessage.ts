import { proto } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import UserMessagesLog from "../../models/UserMessagesLog";
import { logger } from "../../utils/logger";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  userId?: number | string | undefined;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
  userId
}: Request): Promise<proto.WebMessageInfo> => {
  const wbot = await GetTicketWbot(ticket);
  const chatId = `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;

  let message;

  try {
    if (quotedMsg) {
      message = await wbot.sendMessage(
        chatId,
        {
          text: body
        },
        {
          quoted: {
            key: {
              id: quotedMsg.messageId,
              fromMe: quotedMsg.fromMe,
              remoteJid: chatId
            },
            message: {
              conversation: quotedMsg.body
            }
          }
        }
      );
    } else {
      message = await wbot.sendMessage(chatId, {
        text: body
      });
    }

    await ticket.update({
      lastMessage: body,
      lastMessageAt: new Date().getTime()
    });

    try {
      if (userId && message?.key?.id) {
        await UserMessagesLog.create({
          messageId: message.key.id,
          userId,
          ticketId: ticket.id
        });
      }
    } catch (error) {
      logger.error(`Error creating user message log: ${error}`);
    }

    return message;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
