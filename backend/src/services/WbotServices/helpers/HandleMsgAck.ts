import { proto } from "@whiskeysockets/baileys";
import { logger } from "../../../utils/logger";
import { getIO } from "../../../libs/socket";
import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";

const HandleMsgAck = async (
  msg: proto.IWebMessageInfo,
  chat: any,
  ack: number
): Promise<void> => {
  try {
    if (!msg.key.id) return;

    const messageToUpdate = await Message.findOne({
      where: { messageId: msg.key.id },
      include: [
        {
          model: Ticket,
          as: "ticket",
          where: { channel: "whatsapp" },
          include: ["contact"]
        }
      ]
    });

    if (!messageToUpdate) return;

    await messageToUpdate.update({ ack });

    const io = getIO();
    if (messageToUpdate.ticket?.tenantId) {
      io.to(`tenant:${messageToUpdate.ticket.tenantId}:${messageToUpdate.ticketId}`)
        .emit(`tenant:${messageToUpdate.ticket.tenantId}:appMessage`, {
          action: "update",
          message: messageToUpdate
        });
    }
  } catch (err) {
    logger.error(`Error handling message ack: ${err}`);
  }
};

export default HandleMsgAck;
