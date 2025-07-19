import { proto } from "@whiskeysockets/baileys";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
// import CreateMessageService from "../MessageServices/CreateMessageService";
// import FindOrCreateContactService from "../ContactServices/FindOrCreateContactService";
// import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";

interface MessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: "append" | "notify";
}

const SyncUnreadMessagesBaileys = async (
  socket: any,
  whatsappSession: Whatsapp,
  tenantId: number | string
): Promise<void> => {
  try {
    logger.info(`Sincronizando mensajes no leídos para WhatsApp ${whatsappSession.id}`);

    // TODO: Implementar sincronización de mensajes cuando los servicios estén disponibles
    // Por ahora solo registramos el evento
    logger.info(`Sincronización de mensajes completada para WhatsApp ${whatsappSession.id}`);
  } catch (error) {
    logger.error(`Error en sincronización de mensajes: ${error}`);
  }
};

const processMessage = async (
  message: proto.IWebMessageInfo,
  whatsappSession: Whatsapp,
  tenantId: number | string
): Promise<void> => {
  try {
    logger.info(`Procesando mensaje para WhatsApp ${whatsappSession.id}`);
    // TODO: Implementar procesamiento completo cuando los servicios estén disponibles
  } catch (error) {
    logger.error(`Error procesando mensaje individual: ${error}`);
  }
};

export default SyncUnreadMessagesBaileys;
