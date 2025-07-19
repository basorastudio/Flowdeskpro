import Whatsapp from "../../models/Whatsapp";
import { initBaileys } from "../../libs/baileys";
import { logger } from "../../utils/logger";
import { getIO } from "../../libs/socket";

export const StartBaileysSession = async (whatsapp: Whatsapp): Promise<void> => {
  try {
    const io = getIO();
    
    logger.info(`Iniciando sesión Baileys para WhatsApp ${whatsapp.id}`);
    
    await whatsapp.update({
      status: "OPENING",
      qrcode: null,
      retries: 0
    });

    io.emit(`${whatsapp.tenantId}:whatsappSession`, {
      action: "update",
      session: whatsapp
    });

    // Inicializar Baileys
    await initBaileys(whatsapp);
    
  } catch (error) {
    logger.error(`Error iniciando sesión Baileys: ${error}`);
    
    await whatsapp.update({
      status: "DISCONNECTED",
      qrcode: null,
      retries: 0
    });

    const io = getIO();
    io.emit(`${whatsapp.tenantId}:whatsappSession`, {
      action: "update",
      session: whatsapp
    });
    
    throw error;
  }
};
