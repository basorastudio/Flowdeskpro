import { proto } from "@whiskeysockets/baileys";
import { logger } from "../../../utils/logger";
import { getIO } from "../../../libs/socket";
import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";

const verifyRevoked = async (
  msg: proto.IWebMessageInfo,
  tenantId: number | string
): Promise<void> => {
  try {
    if (!msg.key.id) return;

    const messageToUpdate = await Message.findOne({
      where: { messageId: msg.key.id },
      include: [
        {
          model: Ticket,
          as: "ticket",
          where: { tenantId, channel: "whatsapp" },
          include: ["contact"]
        }
      ]
    });

    if (!messageToUpdate) return;

    await messageToUpdate.update({ 
      body: "Esta mensagem foi apagada",
      isDeleted: true 
    });

    const io = getIO();
    io.to(`tenant:${tenantId}:${messageToUpdate.ticketId}`)
      .emit(`tenant:${tenantId}:appMessage`, {
        action: "update",
        message: messageToUpdate
      });
  } catch (err) {
    logger.error(`Error handling revoked message: ${err}`);
  }
};

export default verifyRevoked;
