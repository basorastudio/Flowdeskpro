import { proto } from "@whiskeysockets/baileys";
import { logger } from "../utils/logger";
// import Message from "../../models/Message";

interface HandleMsgAckBaileysData {
  whatsappId: number;
  tenantId: number;
  messageUpdate: Partial<proto.IWebMessageInfo>;
}

const HandleMsgAckBaileys = async (job: any): Promise<void> => {
  try {
    const { messageUpdate }: HandleMsgAckBaileysData = job.data;

    if (!messageUpdate.key?.id) return;

    logger.info(`Actualizando estado de mensaje: ${messageUpdate.key.id}`);

    // TODO: Implementar la actualización del estado del mensaje
    // cuando se corrijan los imports

  } catch (error) {
    logger.error(`Error actualizando estado del mensaje: ${error}`);
    throw error;
  }
};

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
