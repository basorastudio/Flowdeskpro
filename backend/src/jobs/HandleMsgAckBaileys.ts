import { proto } from "@whiskeysockets/baileys";
import { logger } from "../utils/logger";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import CampaignContacts from "../models/CampaignContacts";
import ApiMessage from "../models/ApiMessage";
import socketEmit from "../helpers/socketEmit";
import Queue from "../libs/Queue";

interface HandleMsgAckBaileysData {
  whatsappId: number;
  tenantId: number;
  messageUpdate: Partial<proto.IWebMessageInfo>;
}

const HandleMsgAckBaileys = async (job: any): Promise<void> => {
  try {
    const { whatsappId, tenantId, messageUpdate }: HandleMsgAckBaileysData = job.data;

    if (!messageUpdate.key?.id) return;

    // Esperar un poco para que el mensaje se haya guardado en BD
    await new Promise(r => setTimeout(r, 500));

    // Convertir el estado de Baileys a formato compatible con WWebJS
    const ackStatus = convertBaileysStatusToAck(messageUpdate.status);

    logger.info(`Actualizando estado de mensaje: ${messageUpdate.key.id} a ${ackStatus}`);

    // Buscar el mensaje en la base de datos
    const messageToUpdate = await Message.findOne({
      where: { messageId: messageUpdate.key.id },
      include: [
        "contact",
        {
          model: Ticket,
          as: "ticket",
          attributes: ["id", "tenantId", "apiConfig"]
        },
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        }
      ]
    });

    if (messageToUpdate) {
      await messageToUpdate.update({ ack: ackStatus });
      const { ticket } = messageToUpdate;
      
      // Emitir evento socket para actualizar la UI en tiempo real
      socketEmit({
        tenantId: ticket.tenantId,
        type: "chat:ack",
        payload: messageToUpdate
      });

      // Webhook externo si está configurado
      const apiConfig: any = ticket.apiConfig || {};
      if (apiConfig?.externalKey && apiConfig?.urlMessageStatus) {
        const payload = {
          ack: ackStatus,
          messageId: messageUpdate.key.id,
          ticketId: ticket.id,
          externalKey: apiConfig?.externalKey,
          authToken: apiConfig?.authToken,
          type: "hookMessageStatus"
        };
        
        Queue.add("WebHooksAPI", {
          url: apiConfig.urlMessageStatus,
          type: payload.type,
          payload
        });
      }

      logger.info(`Mensaje actualizado exitosamente: ${messageUpdate.key.id} -> ACK ${ackStatus}`);
    }

    // Actualizar mensaje de API si existe
    const messageAPI = await ApiMessage.findOne({
      where: { messageId: messageUpdate.key.id }
    });

    if (messageAPI) {
      await messageAPI.update({ ack: ackStatus });
    }

    // Actualizar mensaje de campaña si existe
    const messageCampaign = await CampaignContacts.findOne({
      where: { messageId: messageUpdate.key.id }
    });

    if (messageCampaign) {
      await messageCampaign.update({ ack: ackStatus });
    }

  } catch (error) {
    logger.error(`Error actualizando estado del mensaje: ${error}`);
    throw error;
  }
};

// Función para convertir el estado de Baileys a formato ACK de WWebJS
function convertBaileysStatusToAck(status: any): number {
  // Baileys status values:
  // 0: ERROR
  // 1: PENDING
  // 2: SERVER_ACK
  // 3: DELIVERY_ACK
  // 4: READ
  
  // WWebJS ACK values:
  // 0: ACK_ERROR
  // 1: ACK_PENDING
  // 2: ACK_SERVER
  // 3: ACK_DEVICE
  // 4: ACK_READ
  // 5: ACK_PLAYED (for audio)

  switch (status) {
    case 0: return 0; // ERROR
    case 1: return 1; // PENDING
    case 2: return 2; // SERVER_ACK
    case 3: return 3; // DELIVERY_ACK
    case 4: return 4; // READ
    default: return status || 1;
  }
}

export default {
  key: "HandleMsgAckBaileys",
  options: {
    delay: 6000,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 60000
    }
  },
  handle: HandleMsgAckBaileys
};
