import { Request, Response } from "express";
// import path from "path";
// import { rmdir } from "fs/promises";
import { apagarPastaSessao, getWbot, removeWbot } from "../libs/wbot";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import { setValue } from "../libs/redisClient";
import { logger } from "../utils/logger";
import { getTbot, removeTbot } from "../libs/tbot";
import { getInstaBot, removeInstaBot } from "../libs/InstaBot";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;
  const whatsapp = await ShowWhatsAppService({
    id: whatsappId,
    tenantId,
    isInternal: true
  });

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { isQrcode } = req.body;
  const { tenantId } = req.user;

  if (isQrcode) {
    await apagarPastaSessao(whatsappId);
  }

  const { whatsapp } = await UpdateWhatsAppService({
    whatsappId,
    whatsappData: { session: "" },
    tenantId
  });

  // Limpiar datos de Baileys para forzar nueva autenticación
  await DeleteBaileysService(+whatsappId);
  
  StartWhatsAppSession(whatsapp);
  return res.status(200).json({ message: "Starting session." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;

  const channel = await ShowWhatsAppService({ id: whatsappId, tenantId });

  const io = getIO();

  try {
    if (channel.type === "whatsapp") {
      const wbot = getWbot(channel.id);
      await setValue(`${channel.id}-retryQrCode`, 0);
      await wbot.logout();
      removeWbot(channel.id);
      // Eliminar datos de Baileys
      await DeleteBaileysService(channel.id);
    }

    if (channel.type === "telegram") {
      const tbot = getTbot(channel.id);
      await tbot.telegram
        .logOut()
        .catch(error => logger.error("Erro ao fazer logout da conexão", error));
      removeTbot(channel.id);
    }

    if (channel.type === "instagram") {
      const instaBot = getInstaBot(channel.id);
      await instaBot.destroy();
      removeInstaBot(channel);
    }

    await channel.update({
      status: "DISCONNECTED",
      session: "",
      qrcode: ""
    });

    io.emit(`${tenantId}:whatsappSession`, {
      action: "update",
      session: channel
    });

    return res.status(200).json({ message: "Session disconnected." });
  } catch (error) {
    logger.error(`Erro ao desconectar sessão: ${error}`);
    throw new AppError("ERR_DISCONNECT_SESSION");
  }
};

export default { store, remove, update };
