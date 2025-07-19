import { proto } from "@whiskeysockets/baileys";
import { logger } from "../utils/logger";
// import CreateMessageService from "../MessageServices/CreateMessageService";
// import FindOrCreateContactService from "../ContactServices/FindOrCreateContactService";
// import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
// import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
// import { getBodyMessage } from "../WbotServices/helpers/GetBodyMessage";

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
    if (isGroup) return; // Ignorar mensajes de grupo

    // Si es mensaje propio, ignorar
    if (message.key.fromMe) return;

    logger.info(`Procesando mensaje de Baileys para WhatsApp ${whatsappId}`);

    // TODO: Implementar el procesamiento completo del mensaje
    // cuando se corrijan los imports

  } catch (error) {
    logger.error(`Error procesando mensaje Baileys: ${error}`);
    throw error;
  }
};

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
