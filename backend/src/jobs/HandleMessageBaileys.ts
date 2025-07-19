import { proto } from "@whiskeysockets/baileys";
import { logger } from "../utils/logger";
import VerifyContact from "../services/WbotServices/helpers/VerifyContact";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import CreateMessageService from "../services/MessageServices/CreateMessageService";
import VerifyStepsChatFlowTicket from "../services/ChatFlowServices/VerifyStepsChatFlowTicket";
// import verifyBusinessHours from "../services/WbotServices/helpers/VerifyBusinessHours";
import Setting from "../models/Setting";
import Queue from "../libs/Queue";
import Contact from "../models/Contact";
import VerifyMessage from "../services/WbotServices/helpers/VerifyMessage";
import VerifyMediaMessage from "../services/WbotServices/helpers/VerifyMediaMessage";

interface HandleMessageBaileysData {
  whatsappId: number;
  tenantId: number;
  message: proto.IWebMessageInfo;
}

const HandleMessageBaileys = async (job: any): Promise<void> => {
  try {
    const { whatsappId, tenantId, message }: HandleMessageBaileysData = job.data;

    if (!message.key.remoteJid) return;

    const isGroup = message.key.remoteJid.includes("@g.us");
    const isStatus = message.key.remoteJid === "status@broadcast";
    
    // Verificar configuración para ignorar mensajes de grupo
    const settingGroupMsg = await Setting.findOne({
      where: { key: "ignoreGroupMsg", tenantId }
    });

    if (settingGroupMsg?.value === "enabled" && (isGroup || isStatus)) {
      return;
    }

    // Si es mensaje propio, solo procesar si no es de grupo
    if (message.key.fromMe && !isGroup) {
      // Procesar solo ciertos tipos de mensajes propios
      const messageType = Object.keys(message.message || {})[0];
      if (messageType && !["conversation", "extendedTextMessage", "imageMessage", "videoMessage", "audioMessage", "documentMessage"].includes(messageType)) {
        return;
      }
    }

    const whatsapp = await ShowWhatsAppService({ id: whatsappId });
    
    // Extraer información del contacto
    const contactId = isGroup ? message.key.participant : message.key.remoteJid;
    if (!contactId) return;

    // Crear objeto de contacto simulado para VerifyContact
    const msgContact = {
      id: {
        _serialized: contactId.replace("@s.whatsapp.net", ""),
        user: contactId.replace("@s.whatsapp.net", "")
      },
      number: contactId.replace("@s.whatsapp.net", ""),
      pushname: message.pushName || null,
      name: message.pushName || null,
      isGroup: isGroup,
      isUser: !isGroup,
      isWAContact: true
    };

    const contact = await VerifyContact(msgContact, tenantId);
    
    let groupContact: Contact | undefined;
    
    if (isGroup) {
      const groupContactData = {
        id: {
          _serialized: message.key.remoteJid?.replace("@g.us", ""),
          user: message.key.remoteJid?.replace("@g.us", "")
        },
        number: message.key.remoteJid?.replace("@g.us", ""),
        pushname: "Grupo",
        name: "Grupo",
        isGroup: true,
        isUser: false,
        isWAContact: true
      };
      groupContact = await VerifyContact(groupContactData, tenantId);
    }

    // Crear ticket
    const unreadMessages = message.key.fromMe ? 0 : 1;
    
    const ticket = await FindOrCreateTicketService({
      contact,
      whatsappId,
      unreadMessages,
      tenantId,
      groupContact,
      msg: {
        id: {
          id: message.key.id,
          fromMe: message.key.fromMe,
          remote: message.key.remoteJid
        },
        fromMe: message.key.fromMe,
        from: message.key.remoteJid,
        to: whatsapp.number,
        timestamp: message.messageTimestamp,
        body: getMessageBody(message),
        type: getMessageType(message),
        hasMedia: hasMediaMessage(message)
      },
      channel: "baileys"
    });

    if (ticket?.isCampaignMessage || ticket?.isFarewellMessage) {
      return;
    }

    // Crear mensaje adaptado para los servicios existentes
    const adaptedMessage = adaptBaileysMessageToWbot(message);

    if (hasMediaMessage(message)) {
      await VerifyMediaMessage(adaptedMessage, ticket, contact);
    } else {
      await VerifyMessage(adaptedMessage, ticket, contact);
    }

    // Verificar horario comercial
    // const isBusinessHours = await verifyBusinessHours(adaptedMessage, ticket);
    const isBusinessHours = true; // Temporalmente habilitado siempre

    // Ejecutar chatflow si está en horario comercial
    if (isBusinessHours && !message.key.fromMe) {
      await VerifyStepsChatFlowTicket(adaptedMessage, ticket);
    }

    // Webhook externo si está configurado
    const apiConfig: any = ticket.apiConfig || {};
    if (
      !message.key.fromMe &&
      !ticket.isGroup &&
      !ticket.answered &&
      apiConfig?.externalKey &&
      apiConfig?.urlMessageStatus
    ) {
      const payload = {
        timestamp: Date.now(),
        msg: adaptedMessage,
        messageId: message.key.id,
        ticketId: ticket.id,
        externalKey: apiConfig?.externalKey,
        authToken: apiConfig?.authToken,
        type: "hookMessage"
      };
      
      Queue.add("WebHooksAPI", {
        url: apiConfig.urlMessageStatus,
        type: payload.type,
        payload
      });
    }

    logger.info(`Mensaje de Baileys procesado exitosamente para WhatsApp ${whatsappId}`);

  } catch (error) {
    logger.error(`Error procesando mensaje Baileys: ${error}`);
    throw error;
  }
};

// Funciones auxiliares para extraer información del mensaje de Baileys
function getMessageBody(message: proto.IWebMessageInfo): string {
  const msg = message.message;
  if (!msg) return "";

  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
  if (msg.imageMessage?.caption) return msg.imageMessage.caption;
  if (msg.videoMessage?.caption) return msg.videoMessage.caption;
  if (msg.documentMessage?.caption) return msg.documentMessage.caption;
  if (msg.buttonsResponseMessage?.selectedDisplayText) return msg.buttonsResponseMessage.selectedDisplayText;
  if (msg.listResponseMessage?.singleSelectReply?.selectedRowId) return msg.listResponseMessage.singleSelectReply.selectedRowId;
  if (msg.templateButtonReplyMessage?.selectedDisplayText) return msg.templateButtonReplyMessage.selectedDisplayText;
  
  return "";
}

function getMessageType(message: proto.IWebMessageInfo): string {
  const msg = message.message;
  if (!msg) return "chat";

  if (msg.conversation || msg.extendedTextMessage) return "chat";
  if (msg.imageMessage) return "image";
  if (msg.videoMessage) return "video";
  if (msg.audioMessage) return "ptt";
  if (msg.documentMessage) return "document";
  if (msg.stickerMessage) return "sticker";
  if (msg.contactMessage) return "vcard";
  if (msg.locationMessage) return "location";
  if (msg.buttonsResponseMessage) return "buttons_response";
  if (msg.listResponseMessage) return "list_response";
  
  return "chat";
}

function hasMediaMessage(message: proto.IWebMessageInfo): boolean {
  const msg = message.message;
  if (!msg) return false;

  return !!(msg.imageMessage || msg.videoMessage || msg.audioMessage || msg.documentMessage || msg.stickerMessage);
}

// Función para adaptar mensaje de Baileys al formato WbotMessage
function adaptBaileysMessageToWbot(message: proto.IWebMessageInfo): any {
  const body = getMessageBody(message);
  const type = getMessageType(message);
  const hasMedia = hasMediaMessage(message);
  
  return {
    id: {
      id: message.key.id,
      fromMe: message.key.fromMe,
      remote: message.key.remoteJid
    },
    fromMe: !!message.key.fromMe,
    from: message.key.remoteJid,
    to: message.key.remoteJid, // En Baileys no hay 'to' separado
    timestamp: message.messageTimestamp ? Number(message.messageTimestamp) : Date.now(),
    body: body,
    type: type,
    hasMedia: hasMedia,
    // Campos adicionales para compatibilidad
    _data: {
      id: {
        id: message.key.id,
        fromMe: message.key.fromMe,
        remote: message.key.remoteJid
      }
    },
    // Para mensajes de ubicación
    location: message.message?.locationMessage ? {
      latitude: message.message.locationMessage.degreesLatitude,
      longitude: message.message.locationMessage.degreesLongitude,
      options: message.message.locationMessage.name || "Ubicación"
    } : undefined
  };
}

export default {
  key: "HandleMessageBaileys",
  options: {
    delay: 6000,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 60000
    }
  },
  handle: HandleMessageBaileys
};
