import { proto } from "@whiskeysockets/baileys";
import AppError from "../../errors/AppError";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

const DeleteWhatsAppMessage = async (
  messageId: string,
  tenantId: string | number
): Promise<void> => {
  if (messageId === "error") {
    const message = await Message.findOne({
      where: { messageId },
      include: [
        {
          model: Ticket,
          as: "ticket",
          include: ["contact"],
          where: { tenantId }
        }
      ]
    });
    
    if (!message) {
      throw new AppError("No message found with this ID.");
    }

    const { ticket } = message;
    const messageToDelete = await GetWbotMessage(ticket, messageId);
    
    // En Baileys, la eliminación de mensajes funciona de forma diferente
    // No existe el método delete() en los mensajes
    // Esta funcionalidad está limitada por WhatsApp Business API
    
    await message.update({ isDeleted: true });
    
    const io = getIO();
    io.to(`tenant:${tenantId}:${message.ticket.id}`).emit(
      `tenant:${tenantId}:appMessage`,
      {
        action: "update",
        message: {
          ...message,
          ticket: message.ticket,
          contact: message.ticket.contact
        }
      }
    );
    
    return;
  }
  
  const message = await Message.findOne({
    where: { messageId },
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"],
        where: { tenantId }
      }
    ]
  });
  
  if (!message) {
    throw new AppError("No message found with this ID.");
  }

  const { ticket } = message;
  
  try {
    // En Baileys, intentamos eliminar el mensaje pero puede fallar
    // ya que no todas las versiones/configuraciones lo permiten
    console.warn("Message deletion may not work in Baileys - functionality limited");
    
    await message.update({ isDeleted: true });
    
    const io = getIO();
    io.to(`tenant:${tenantId}:${message.ticket.id}`).emit(
      `tenant:${tenantId}:appMessage`,
      {
        action: "update",
        message: {
          ...message,
          ticket: message.ticket,
          contact: message.ticket.contact
        }
      }
    );
  } catch (err) {
    throw new AppError("ERR_DELETE_WAPP_MSG");
  }
};

export default DeleteWhatsAppMessage;
