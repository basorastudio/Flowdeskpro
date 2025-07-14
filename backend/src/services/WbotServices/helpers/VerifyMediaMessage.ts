import { proto } from "@whiskeysockets/baileys";
import { logger } from "../../../utils/logger";
import { getIO } from "../../../libs/socket";
import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import Contact from "../../../models/Contact";

const VerifyMediaMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
): Promise<void> => {
  try {
    // En Baileys, el manejo de medios es diferente
    // Verificamos si el mensaje tiene contenido multimedia
    const hasMedia = !!(
      msg.message?.imageMessage ||
      msg.message?.videoMessage ||
      msg.message?.audioMessage ||
      msg.message?.documentMessage ||
      msg.message?.stickerMessage
    );

    if (!hasMedia) return;

    const messageData = {
      messageId: msg.key.id || "",
      ticketId: ticket.id,
      contactId: msg.key.fromMe ? undefined : contact.id,
      body: msg.message?.imageMessage?.caption || 
            msg.message?.videoMessage?.caption || 
            "📎 Arquivo de mídia",
      fromMe: msg.key.fromMe || false,
      mediaType: getMediaType(msg),
      read: msg.key.fromMe || false,
      timestamp: (msg.messageTimestamp as number) * 1000,
      status: "received"
    };

    // Aqui você pode adicionar lógica para download e processamento de mídia
    // usando as funcionalidades do Baileys

    const io = getIO();
    if (ticket.tenantId) {
      io.to(`tenant:${ticket.tenantId}:${ticket.id}`)
        .emit(`tenant:${ticket.tenantId}:appMessage`, {
          action: "create",
          message: messageData
        });
    }
  } catch (err) {
    logger.error(`Error handling media message: ${err}`);
  }
};

const getMediaType = (msg: proto.IWebMessageInfo): string => {
  if (msg.message?.imageMessage) return "image";
  if (msg.message?.videoMessage) return "video";
  if (msg.message?.audioMessage) return "audio";
  if (msg.message?.documentMessage) return "document";
  if (msg.message?.stickerMessage) return "sticker";
  return "unknown";
};

export default VerifyMediaMessage;
