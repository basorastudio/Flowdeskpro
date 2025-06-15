import { differenceInHours, parseJSON } from "date-fns";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import { getTbot } from "../libs/tbot";
import { getInstaBot } from "../libs/InstaBot";
import GetWbotMessage from "./GetWbotMessage";
import { getWbot } from "../libs/wbot";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

const DeleteMessageSystem = async (
  messageId: string,
  tenantId: number | string
): Promise<void> => {
  const message = await Message.findOne({
    where: { id: messageId, tenantId },
    include: [
      {
        association: "ticket",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new AppError("No message found with this ID.");
  }

  // Verificar si el mensaje puede ser eliminado (dentro de 2 horas)
  const currentTime = new Date().getTime();
  const messageTime = new Date(message.createdAt).getTime();
  const timeDifference = currentTime - messageTime;
  const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 horas en milisegundos

  if (timeDifference > twoHoursInMs && message.fromMe) {
    if (message.status !== "pending") {
      throw new AppError("Cannot delete message after 2 hours of being sent");
    }
  }

  // Si es un mensaje programado pendiente, simplemente eliminarlo de la BD
  if (message.messageId === null && message.status === "pending") {
    await message.destroy();
    console.log("Scheduled message deleted from the database.");
    return;
  }

  const { ticket } = message;

  if (ticket.channel === "whatsapp") {
    try {
      const wbot = getWbot(ticket.whatsappId);
      const chatId = `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
      
      // En Baileys, usamos sendMessage con delete para eliminar mensajes
      await wbot.sendMessage(chatId, {
        delete: {
          id: message.messageId,
          fromMe: message.fromMe,
          remoteJid: chatId
        }
      });
      
      logger.info(`Message deleted successfully: ${message.messageId}`);
    } catch (error) {
      logger.error(`Error deleting WhatsApp message: ${error}`);
      // Continuar con el marcado como eliminado aunque falle la eliminación en WhatsApp
    }
  }

  if (ticket.channel === "telegram") {
    const telegramBot = await getTbot(ticket.whatsappId);
    await telegramBot.telegram.deleteMessage(
      ticket.contact.telegramId,
      +message.messageId
    );
  }

  if (ticket.channel === "instagram") {
    // Instagram deletion logic here
    return;
  }

  if (ticket.channel === "messenger") {
    return;
  }

  // Marcar mensaje como eliminado en la base de datos
  await message.update({ isDeleted: true });
  console.log("Message marked as deleted");

  const io = getIO();
  io.to(`tenant:${tenantId}:${ticket.id}`).emit(
    `tenant:${tenantId}:appMessage`,
    {
      action: "update",
      message,
      ticket,
      contact: ticket.contact
    }
  );
};

export default DeleteMessageSystem;
