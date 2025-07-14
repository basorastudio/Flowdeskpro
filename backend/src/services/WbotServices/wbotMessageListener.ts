import { WASocket, WAMessage, proto, WAMessageKey, WAMessageUpdate, WAMessageStatus } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import { logger } from "../../utils/logger";
import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import CreateMessageService from "../MessageServices/CreateMessageService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";

type Session = WASocket & {
  id?: number;
};

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: any;
}

const getBodyMessage = (msg: proto.IWebMessageInfo): string => {
  try {
    return (
      msg.message?.conversation ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.buttonsResponseMessage?.selectedButtonId ||
      msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
      msg.message?.templateButtonReplyMessage?.selectedId ||
      ""
    );
  } catch (error) {
    return "";
  }
};

const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
  try {
    const messageType = Object.keys(msg.message || {})[0];
    
    switch (messageType) {
      case "conversation":
      case "extendedTextMessage":
        return "chat";
      case "imageMessage":
        return "image";
      case "videoMessage":
        return "video";
      case "audioMessage":
        return "audio";
      case "documentMessage":
        return "document";
      case "stickerMessage":
        return "sticker";
      case "locationMessage":
        return "location";
      case "contactMessage":
        return "contact";
      default:
        return "chat";
    }
  } catch (error) {
    return "chat";
  }
};

const getQuotedMessage = (msg: proto.IWebMessageInfo): string | undefined => {
  try {
    return msg.message?.extendedTextMessage?.contextInfo?.stanzaId || undefined;
  } catch (error) {
    return undefined;
  }
};

const wbotMessageListener = (wbot: Session, tenantId: number | string): void => {
  try {
    wbot.ev.on("messages.upsert", async (messageUpsert: ImessageUpsert) => {
      const messages = messageUpsert.messages
        .filter(msg => !msg.key.fromMe && msg.messageTimestamp && 
          (msg.messageTimestamp as number) > Math.floor(Date.now() / 1000) - 300)
        .map(msg => msg);

      if (!messages.length) return;

      messages.forEach(async msg => {
        await handleMessage(msg, wbot, tenantId);
      });
    });

    wbot.ev.on("messages.update", async (messageUpdate: WAMessageUpdate[]) => {
      if (messageUpdate.length === 0) return;
      
      for (const { key, update } of messageUpdate) {
        if (key.fromMe) return;
        
        try {
          if (!key.id) continue;
          
          const msgContact = await Message.findOne({
            where: { messageId: key.id, tenantId }
          });

          if (msgContact && (update.status === proto.WebMessageInfo.Status.DELIVERY_ACK || update.status === proto.WebMessageInfo.Status.READ)) {
            await msgContact.update({ ack: update.status });
            
            const io = getIO();
            io.to(`tenant:${tenantId}:${msgContact.ticketId}`).emit(`tenant:${tenantId}:appMessage`, {
              action: "update",
              message: msgContact
            });
          }
        } catch (err) {
          Sentry.captureException(err);
          logger.error(`Error handling message update: ${err.message}`);
        }
      }
    });

  } catch (error) {
    Sentry.captureException(error);
    logger.error(`Error on wbotMessageListener: ${error.message}`);
  }
};

const handleMessage = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  tenantId: number | string
): Promise<void> => {
  try {
    let msgContact: any;
    const isGroup = msg.key.remoteJid?.endsWith("@g.us") || false;

    if (isGroup) {
      msgContact = {
        id: msg.key.participant,
        name: msg.key.participant
      };
    } else {
      msgContact = {
        id: msg.key.remoteJid,
        name: msg.key.remoteJid
      };
    }

    const contactData = {
      name: msgContact.name || msgContact.id?.replace(/\D/g, "") || "Unknown",
      number: msgContact.id?.replace(/\D/g, "") || "0",
      isGroup,
      tenantId,
      pushname: msgContact.name || "Unknown",
      isUser: true,
      isWAContact: true
    };

    const contact = await CreateOrUpdateContactService(contactData);
    
    const ticket = await FindOrCreateTicketService({
      contact,
      whatsappId: wbot.id!,
      unreadMessages: 0,
      tenantId,
      msg,
      channel: "whatsapp"
    });

    if (!msg.key.id) return;

    const messageData = {
      messageId: msg.key.id,
      ticketId: ticket.id,
      contactId: msg.key.fromMe ? undefined : contact.id,
      body: getBodyMessage(msg),
      fromMe: msg.key.fromMe || false,
      mediaType: getTypeMessage(msg),
      read: msg.key.fromMe || false,
      quotedMsgId: getQuotedMessage(msg),
      ack: msg.status || 0,
      remoteJid: msg.key.remoteJid,
      participant: msg.key.participant,
      dataJson: JSON.stringify(msg)
    };

    await CreateMessageService({ messageData, tenantId: tenantId });

  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling message: ${err.message}`);
  }
};

// Mantener función para compatibilidad
const HandleMessage = handleMessage;

export { wbotMessageListener, HandleMessage };
