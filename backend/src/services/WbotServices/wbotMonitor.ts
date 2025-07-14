import { WASocket } from "@whiskeysockets/baileys";

import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import { StartWhatsAppSession } from "./StartWhatsAppSession";

type Session = WASocket & {
  id?: number;
};

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp
): Promise<void> => {
  const io = getIO();
  const sessionName = whatsapp.name;

  try {
    // En Baileys, el estado se maneja a través de connection.update
    // No hay eventos separados como change_state o change_battery
    logger.info(`Monitor session: ${sessionName} - Baileys implementation`);

    // Actualizar estado de la sesión
    try {
      await whatsapp.update({ status: "CONNECTED" });
    } catch (err) {
      logger.error(err);
    }

    io.emit(`${whatsapp.tenantId}:whatsappSession`, {
      action: "update",
      session: whatsapp
    });

    // En Baileys, los eventos de desconexión se manejan en connection.update
    // dentro del archivo wbot.ts, no necesitamos manejarlos aquí
  } catch (err) {
    logger.error(err);
  }
};

export default wbotMonitor;
