import fs from "fs";
import { proto } from "@whiskeysockets/baileys";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import UserMessagesLog from "../../models/UserMessagesLog";
import { logger } from "../../utils/logger";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  userId: number | string | undefined;
}

const SendWhatsAppMedia = async ({
  media,
  ticket,
  userId
}: Request): Promise<proto.WebMessageInfo> => {
  try {
    const wbot = await GetTicketWbot(ticket);
    const chatId = `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;

    const mediaBuffer = fs.readFileSync(media.path);
    
    let message;
    
    // Determinar el tipo de media basado en mimetype
    if (media.mimetype.startsWith('image/')) {
      message = await wbot.sendMessage(chatId, {
        image: mediaBuffer,
        caption: media.originalname,
        mimetype: media.mimetype
      });
    } else if (media.mimetype.startsWith('video/')) {
      message = await wbot.sendMessage(chatId, {
        video: mediaBuffer,
        caption: media.originalname,
        mimetype: media.mimetype
      });
    } else if (media.mimetype.startsWith('audio/')) {
      message = await wbot.sendMessage(chatId, {
        audio: mediaBuffer,
        mimetype: media.mimetype,
        ptt: true // Para enviar como nota de voz
      });
    } else {
      // Para documentos
      message = await wbot.sendMessage(chatId, {
        document: mediaBuffer,
        fileName: media.originalname,
        mimetype: media.mimetype
      });
    }

    await ticket.update({
      lastMessage: media.originalname,
      lastMessageAt: new Date().getTime()
    });

    try {
      if (userId) {
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
    logger.error(`Error sending media: ${err}`);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;
