import { proto } from "@whiskeysockets/baileys";
import AppError from "../../errors/AppError";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

const EditWhatsAppMessage = async (
  messageId: string,
  messageBody: string,
  tenantId: string | number
): Promise<void> => {
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
    // En Baileys, la edición de mensajes tiene limitaciones
    // No existe el método edit() como en whatsapp-web.js
    console.warn("Message editing not available in Baileys - functionality limited");
    
    // Solo actualizamos en la base de datos
    await message.update({ 
      body: messageBody,
      isEdited: true 
    });

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
    throw new AppError("ERR_EDIT_WAPP_MSG");
  }
};

export default EditWhatsAppMessage;
