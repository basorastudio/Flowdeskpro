import { proto } from "@whiskeysockets/baileys";
import Ticket from "../models/Ticket";
import GetTicketWbot from "./GetTicketWbot";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

export const GetWbotMessage = async (
  ticket: Ticket,
  messageId: string,
  totalMessages = 100
): Promise<proto.WebMessageInfo | undefined> => {
  try {
    const wbot = await GetTicketWbot(ticket);

    logger.warn(
      `GetWbotMessage called for messageId ${messageId} - Limited functionality with Baileys`
    );

    return undefined;
  } catch (err) {
    logger.error(err);
    throw new AppError("ERR_FETCH_WAPP_MSG");
  }
};

export default GetWbotMessage;
