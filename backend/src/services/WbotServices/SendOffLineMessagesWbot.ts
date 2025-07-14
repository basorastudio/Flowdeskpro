import { proto } from "@whiskeysockets/baileys";
import { getWbot } from "../../libs/wbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";

const SendOffLineMessagesWbot = async (
  tenantId: number | string
): Promise<void> => {
  try {
    const messages = await Message.findAll({
      where: {
        tenantId,
        status: "pending",
        fromMe: true
      },
      include: [
        {
          model: Ticket,
          as: "ticket",
          where: { channel: "whatsapp" },
          include: ["contact", "whatsapp"]
        }
      ]
    });

    for (const message of messages) {
      try {
        const wbot = getWbot(message.ticket.whatsappId);
        if (!wbot || !wbot.user) {
          continue;
        }

        const chatId = `${message.ticket.contact.number}@${message.ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;

        const sentMessage = await wbot.sendMessage(chatId, { text: message.body });

        if (sentMessage) {
          await message.update({
            messageId: sentMessage.key.id,
            status: "sent",
            ack: 1
          });
        }
      } catch (error) {
        logger.error(`Error sending offline message ${message.id}: ${error}`);
        await message.update({ status: "error" });
      }
    }
  } catch (error) {
    logger.error(`Error in SendOffLineMessagesWbot: ${error}`);
  }
};

export default SendOffLineMessagesWbot;
